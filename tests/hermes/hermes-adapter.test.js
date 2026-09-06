#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const { createScheduledJob } = require('../../core/scheduling/job');
const { HermesWorkflowNotSupportedError, WRAPPER_PATHS, resolveHermesWorkflow } = require('../../adapters/hermes/resolver');
const { getSkillCompatibility, isHermesWrapperCandidate } = require('../../adapters/hermes/skill-compatibility');
const { createDelegateRequest, resolveDelegateRequest } = require('../../adapters/hermes/delegation');
const { toHermesCronJob } = require('../../adapters/hermes/scheduling/cron');
const { createGatewayDescriptor, formatGatewayNotification } = require('../../adapters/hermes/gateway/descriptors');
const { ONEPASSWORD_OPERATION_REGISTRY, prepareRuntimeInjection } = require('../../adapters/secrets/1password/operations');

assert.equal(fs.existsSync(path.join(root, 'HERMES.md')), true, 'HERMES.md must exist');

for (const [workflowId, wrapperPath] of Object.entries(WRAPPER_PATHS)) {
  const resolution = resolveHermesWorkflow(workflowId);
  assert.equal(resolution.target.path, wrapperPath);
  assert.equal(resolution.executable, false);
  assert.equal(resolution.mode, 'dry_run');
  assert.equal(fs.existsSync(path.join(root, wrapperPath)), true, `wrapper missing: ${wrapperPath}`);
}
assert.throws(() => resolveHermesWorkflow('unknown.workflow'), /unknown workflow/);
assert.throws(
  () => resolveHermesWorkflow('toolkit.execute'),
  (error) => error instanceof HermesWorkflowNotSupportedError && error.requires_child_risk_resolution === true,
);

assert.equal(getSkillCompatibility('revisora').classification, 'HERMES_NATIVE');
assert.equal(getSkillCompatibility('pesquisa-mercado').classification, 'HERMES_WRAPPER');
assert.equal(isHermesWrapperCandidate({ classification: 'CLAUDE_ONLY_TEMP' }), false);
assert.equal(resolveHermesWorkflow('copy.social').executable, false);

const delegate = createDelegateRequest({
  delegate_id: 'delegate-fixture', agent: 'revisor-pesquisa', workflow_id: 'research.market',
  product_slug: 'fixture-product', task: 'review fixture', allowed_capabilities: ['filesystem.read'],
  input_paths: ['meus-produtos/fixture-product/pesquisa-mercado.md'], output_contract: { type: 'review' },
});
assert.equal(resolveDelegateRequest(delegate).dispatched, false);
assert.throws(() => createDelegateRequest({ ...delegate, allowed_capabilities: ['secrets.read'] }), /forbidden/);
assert.throws(() => createDelegateRequest({ ...delegate, allowed_capabilities: ['research.fetch'] }), /forbidden/);

function buildJob(approvalPolicy) {
  return createScheduledJob({
    job_id: `hermes-${approvalPolicy.mode}`, workflow_id: 'copy.social', input: { product_slug: 'fixture-product' },
    schedule: { kind: 'cron', expression: '0 9 * * *' }, timezone: 'America/Manaus',
    idempotency_key: `idempotency-${approvalPolicy.mode}`, approval_policy: approvalPolicy,
    destination: { kind: 'local' }, enabled: true,
  });
}

const standingCron = toHermesCronJob(buildJob({
  mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture-user',
}));
assert.equal(standingCron.timezone, 'America/Manaus');
assert.equal(standingCron.idempotency_key, 'idempotency-standing');
assert.equal(standingCron.workdir, root);
assert.equal(standingCron.external_capability_granted, false);
assert.equal(standingCron.scheduled, true);

const disabledCron = toHermesCronJob(buildJob({ mode: 'disabled', workflow_id: 'copy.social' }));
assert.equal(disabledCron.scheduled, false);
assert.equal(disabledCron.reason, 'approval_disabled');
const manualCron = toHermesCronJob(buildJob({ mode: 'manual', workflow_id: 'copy.social' }));
assert.equal(manualCron.scheduled, false);
assert.equal(manualCron.reason, 'manual_approval_required');

const descriptor = createGatewayDescriptor({
  event: 'approval.request', channel: 'telegram', payload: { workflow_id: 'copy.social' },
});
assert.equal(formatGatewayNotification(descriptor).sent, false);
assert.throws(() => createGatewayDescriptor({
  event: 'approval.request', channel: 'telegram', payload: { token: 'not-allowed' },
}), /not allowed/);

assert.equal(typeof prepareRuntimeInjection('research.fetch').get_secret, 'undefined');
assert.equal(ONEPASSWORD_OPERATION_REGISTRY.every((operation) => operation.execution === 'blocked'), true);
assert.equal(prepareRuntimeInjection('research.fetch').injected, false);

const forbiddenWrapperPatterns = [/https?:\/\//i, /\bfetch\s*\(/i, /\bcurl\b/i, /\bop\s+(read|run)\b/i];
for (const wrapperPath of Object.values(WRAPPER_PATHS)) {
  const content = fs.readFileSync(path.join(root, wrapperPath), 'utf8');
  for (const pattern of forbiddenWrapperPatterns) {
    assert.equal(pattern.test(content), false, `${wrapperPath} must not call an external API`);
  }
}

process.stdout.write('Hermes adapter contracts: ok\n');
