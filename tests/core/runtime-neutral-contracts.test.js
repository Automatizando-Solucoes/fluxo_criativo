#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const { APPROVAL_MODES, createApprovalPolicy, evaluateApproval } = require('../../core/approvals/policy');
const { MockSecretProvider } = require('../../core/secrets/provider');
const { createScheduledJob } = require('../../core/scheduling/job');
const { InMemoryScheduler } = require('../../core/scheduling/in-memory');
const { getActiveProduct, getProductPath, getArtifactPath } = require('../../core/state/product-state');
const { createWorkflowRegistry, workflowRegistry, UnknownWorkflowError } = require('../../core/workflows/registry');
const { workflowDefinitions } = require('../../core/workflows/definitions');
const { resolveClaudeWorkflow } = require('../../adapters/claude/resolver');
const { resolveHermesWorkflow } = require('../../adapters/hermes/resolver');
const { resolveCodexWorkflow } = require('../../adapters/codex/resolver');

assert.equal(new Set(workflowRegistry.list().map((workflow) => workflow.id)).size, workflowDefinitions.length);
assert.equal(workflowRegistry.list().length, 7);
assert.throws(() => createWorkflowRegistry([workflowDefinitions[0], workflowDefinitions[0]]), /duplicate workflow id/);

assert.deepEqual(APPROVAL_MODES, ['manual', 'standing', 'disabled']);
const standing = createApprovalPolicy({
  mode: 'standing', workflow_id: 'research.market', product: 'fixture-product',
  expires_at: '2030-01-01T00:00:00.000Z', authorized_by: 'fixture-user',
  created_at: '2029-01-01T00:00:00.000Z', limits: { runs: 2 },
});
assert.equal(evaluateApproval(standing, '2029-06-01T00:00:00.000Z').allowed, true);
assert.equal(evaluateApproval(standing, '2030-01-01T00:00:00.000Z').reason, 'expired');
const disabled = createApprovalPolicy({ mode: 'disabled', workflow_id: 'copy.social' });
assert.deepEqual(evaluateApproval(disabled), { allowed: false, reason: 'disabled' });

const secretProvider = new MockSecretProvider({
  IMAGE_API_KEY: 'op://fixture-vault/image-provider/api-key',
});
assert.equal(secretProvider.has_secret('IMAGE_API_KEY'), true);
assert.equal(secretProvider.secret_reference('IMAGE_API_KEY'), 'op://fixture-vault/image-provider/api-key');
assert.equal(typeof secretProvider.get_secret, 'undefined');
assert.deepEqual(secretProvider.run_with_secrets(
  { id: 'image.generate', allowed_secret_names: ['IMAGE_API_KEY'] }, ['IMAGE_API_KEY'],
), {
  operation_id: 'image.generate', required_secrets: ['IMAGE_API_KEY'], injected: false, status: 'ready_for_runtime_injection',
});
assert.throws(() => secretProvider.run_with_secrets(
  { id: 'image.generate', allowed_secret_names: [] }, ['IMAGE_API_KEY'],
), /not allowlisted/);

const job = createScheduledJob({
  job_id: 'fixture-job', workflow_id: 'copy.social', input: { product_slug: 'fixture-product' },
  schedule: { kind: 'cron', expression: '0 9 * * *' }, timezone: 'America/Manaus',
  idempotency_key: 'fixture-key', approval_policy: { mode: 'standing' },
  destination: { kind: 'local' }, enabled: true,
});
assert.equal(new InMemoryScheduler().register(job).timezone, 'America/Manaus');
assert.throws(() => createScheduledJob({ ...job, timezone: 'Not/A_Zone' }), /invalid IANA timezone/);
assert.throws(() => createScheduledJob({ ...job, schedule: { kind: 'cron' } }), /expression/);

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'runtime-core-state-'));
try {
  fs.mkdirSync(path.join(fixtureRoot, 'meus-produtos', 'fixture-product'), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, 'meus-produtos', '.ativo'), 'fixture-product\n');
  assert.equal(getActiveProduct(fixtureRoot), 'fixture-product');
  assert.equal(getProductPath('fixture-product', fixtureRoot), path.join(fixtureRoot, 'meus-produtos', 'fixture-product'));
  assert.equal(getArtifactPath('fixture-product', 'research', fixtureRoot), path.join(fixtureRoot, 'meus-produtos', 'fixture-product', 'pesquisa-mercado.md'));
  assert.throws(() => getProductPath('../outside', fixtureRoot), /product slug/);
  assert.throws(() => getArtifactPath('fixture-product', '../outside', fixtureRoot), /unknown artifact/);
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

assert.equal(resolveClaudeWorkflow('copy.social').target.path, '.claude/commands/copy-social.md');
assert.equal(resolveClaudeWorkflow('copy.social').executable, false);
assert.equal(resolveHermesWorkflow('copy.social').target.status, 'not_implemented');
assert.equal(resolveCodexWorkflow('copy.social').target.status, 'not_implemented');
assert.throws(() => resolveClaudeWorkflow('unknown.workflow'), UnknownWorkflowError);

for (const requiredPath of ['.claude/agents', '.claude/commands', '.claude/skills', 'CLAUDE.md', 'AGENTS.md']) {
  assert.equal(fs.existsSync(path.join(root, requiredPath)), true, `legacy asset missing: ${requiredPath}`);
}
assert.match(fs.readFileSync(path.join(root, '.gitignore'), 'utf8'), /meus-produtos\//, 'product state must remain local and gitignored');

process.stdout.write('runtime-neutral core contracts: ok\n');
