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
const { INTEGRATION_CAPABILITIES } = require('../../core/integrations/contracts');
const { resolveClaudeWorkflow } = require('../../adapters/claude/resolver');
const { resolveHermesWorkflow } = require('../../adapters/hermes/resolver');
const { resolveCodexWorkflow } = require('../../adapters/codex/resolver');

assert.equal(new Set(workflowRegistry.list().map((workflow) => workflow.id)).size, workflowDefinitions.length);
assert.equal(workflowRegistry.list().length, 7);
assert.throws(() => createWorkflowRegistry([workflowDefinitions[0], workflowDefinitions[0]]), /duplicate workflow id/);
const immutableWorkflow = workflowRegistry.get('copy.social');
assert.throws(() => immutableWorkflow.outputs.push('unexpected_output'), TypeError);
assert.throws(() => { immutableWorkflow.inputs.product_slug.required = false; }, TypeError);
assert.throws(() => { immutableWorkflow.side_effects.external = true; }, TypeError);
assert.throws(() => immutableWorkflow.capabilities.push('unexpected.capability'), TypeError);
const intactWorkflow = workflowRegistry.get('copy.social');
assert.deepEqual(intactWorkflow.outputs, ['content_file']);
assert.equal(intactWorkflow.inputs.product_slug.required, true);
assert.equal(intactWorkflow.side_effects.external, false);
assert.deepEqual(intactWorkflow.capabilities, ['filesystem.read', 'filesystem.write']);
for (const workflow of workflowRegistry.list()) {
  if (workflow.capabilities.some((capability) => INTEGRATION_CAPABILITIES.includes(capability))) {
    assert.equal(workflow.side_effects.external, true, `${workflow.id} must declare external interaction`);
  }
}

assert.deepEqual(APPROVAL_MODES, ['manual', 'standing', 'disabled']);
const standing = createApprovalPolicy({
  mode: 'standing', workflow_id: 'research.market', product: 'fixture-product',
  network: 'web', action_type: 'research', expires_at: '2030-01-01T00:00:00.000Z',
  authorized_by: 'fixture-user', created_at: '2029-01-01T00:00:00.000Z', limits: { runs: 2 },
});
const standingContext = {
  workflow_id: 'research.market', product: 'fixture-product', network: 'web', action_type: 'research',
  action_id: 'research-1', now: '2029-06-01T00:00:00.000Z', usage: { runs: 2 },
};
assert.equal(evaluateApproval(standing, standingContext).allowed, true);
assert.throws(() => { standing.limits.runs = 999; }, TypeError);
assert.equal(standing.limits.runs, 2);
assert.equal(evaluateApproval(standing, { ...standingContext, workflow_id: 'copy.social' }).reason, 'workflow_mismatch');
assert.equal(evaluateApproval(standing, { ...standingContext, product: 'other-product' }).reason, 'product_mismatch');
assert.equal(evaluateApproval(standing, { ...standingContext, network: 'other-network' }).reason, 'network_mismatch');
assert.equal(evaluateApproval(standing, { ...standingContext, action_type: 'other-action' }).reason, 'action_type_mismatch');
assert.equal(evaluateApproval(standing, { ...standingContext, now: '2030-01-01T00:00:00.000Z' }).reason, 'expired');
assert.equal(evaluateApproval(standing, { ...standingContext, usage: { runs: 3 } }).reason, 'limit_exceeded:runs');
assert.equal(evaluateApproval(standing, { ...standingContext, usage: {} }).reason, 'limits_not_evaluated');
assert.equal(evaluateApproval(createApprovalPolicy({ mode: 'standing', workflow_id: 'research.market', revoked_at: '2029-01-02T00:00:00.000Z', authorized_by: 'fixture-user' }), { workflow_id: 'research.market' }).reason, 'revoked');
const disabled = createApprovalPolicy({ mode: 'disabled', workflow_id: 'copy.social' });
assert.deepEqual(evaluateApproval(disabled, { workflow_id: 'copy.social' }), { allowed: false, reason: 'disabled' });
const manual = createApprovalPolicy({ mode: 'manual', workflow_id: 'copy.social' });
assert.equal(evaluateApproval(manual, { workflow_id: 'copy.social', action_id: 'publish-1' }).reason, 'manual_grant_required');
const manualForOtherAction = createApprovalPolicy({
  mode: 'manual', workflow_id: 'copy.social',
  manual_grant: { action_id: 'publish-2', approved_by: 'fixture-user', approved_at: '2029-01-01T00:00:00.000Z' },
});
assert.equal(evaluateApproval(manualForOtherAction, { workflow_id: 'copy.social', action_id: 'publish-1' }).reason, 'manual_action_mismatch');
const manualGranted = createApprovalPolicy({
  mode: 'manual', workflow_id: 'copy.social',
  manual_grant: { action_id: 'publish-1', approved_by: 'fixture-user', approved_at: '2029-01-01T00:00:00.000Z' },
});
assert.deepEqual(evaluateApproval(manualGranted, { workflow_id: 'copy.social', action_id: 'publish-1' }), { allowed: true, reason: 'manual' });

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
  idempotency_key: 'fixture-key', approval_policy: {
    mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture-user',
  },
  destination: { kind: 'local' }, enabled: true,
});
const scheduler = new InMemoryScheduler();
assert.equal(scheduler.register(job).timezone, 'America/Manaus');
assert.throws(() => { job.input.product_slug = 'other-product'; }, TypeError);
assert.equal(job.input.product_slug, 'fixture-product');
assert.throws(() => scheduler.register({ ...job, job_id: 'fixture-job-2' }), /idempotency key already registered/);
assert.throws(() => createScheduledJob({
  ...job, approval_policy: { mode: 'standing', workflow_id: 'research.market', authorized_by: 'fixture-user' },
}), /must match job.workflow_id/);
assert.throws(() => createScheduledJob({ ...job, approval_policy: { mode: 'standing' } }), /workflow_id is required/);
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
assert.equal(resolveHermesWorkflow('copy.social').target.kind, 'hermes.skill');
assert.equal(resolveHermesWorkflow('copy.social').mode, 'dry_run');
assert.equal(resolveHermesWorkflow('copy.social').executable, false);
assert.equal(resolveCodexWorkflow('copy.social').target.status, 'not_implemented');
assert.equal(resolveClaudeWorkflow('toolkit.execute').requires_child_risk_resolution, true);
assert.throws(() => resolveClaudeWorkflow('unknown.workflow'), UnknownWorkflowError);

for (const requiredPath of ['.claude/agents', '.claude/commands', '.claude/skills', 'CLAUDE.md', 'AGENTS.md']) {
  assert.equal(fs.existsSync(path.join(root, requiredPath)), true, `legacy asset missing: ${requiredPath}`);
}
assert.match(fs.readFileSync(path.join(root, '.gitignore'), 'utf8'), /meus-produtos\//, 'product state must remain local and gitignored');

process.stdout.write('runtime-neutral core contracts: ok\n');
