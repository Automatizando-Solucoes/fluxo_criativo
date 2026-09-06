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

const EXPECTED_SLASH_COMMANDS = Object.freeze({
  'research.market': 'pesquisa-mercado',
  'copy.page': 'copy-pagina',
  'copy.ad': 'copy-anuncio',
  'copy.social': 'copy-social',
  'creative.static': 'criativo-estatico',
  'traffic.insights': 'trafego-insights',
});

function getFrontmatterField(content, field) {
  const match = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

assert.equal(fs.existsSync(path.join(root, 'HERMES.md')), true, 'HERMES.md must exist');

const wrapperNames = new Set();
const wrapperWorkflowIds = new Set();
for (const [workflowId, wrapperPath] of Object.entries(WRAPPER_PATHS)) {
  const resolution = resolveHermesWorkflow(workflowId);
  assert.equal(resolution.target.path, wrapperPath);
  assert.equal(resolution.executable, false);
  assert.equal(resolution.mode, 'dry_run');
  assert.equal(fs.existsSync(path.join(root, wrapperPath)), true, `wrapper missing: ${wrapperPath}`);
  const content = fs.readFileSync(path.join(root, wrapperPath), 'utf8');
  const name = getFrontmatterField(content, 'name');
  assert.ok(name, `${wrapperPath} must declare a name`);
  assert.ok(getFrontmatterField(content, 'description'), `${wrapperPath} must declare a description`);
  assert.equal(getFrontmatterField(content, 'version'), '1.0.0');
  assert.equal(getFrontmatterField(content, 'workflow_id'), workflowId);
  assert.equal(name, EXPECTED_SLASH_COMMANDS[workflowId]);
  assert.equal(wrapperNames.has(name), false, `duplicate wrapper name: ${name}`);
  assert.equal(wrapperWorkflowIds.has(workflowId), false, `duplicate wrapper workflow: ${workflowId}`);
  wrapperNames.add(name);
  wrapperWorkflowIds.add(workflowId);
  assert.match(content, /adapters\/hermes\/SOURCE-POLICY\.md/);
}
assert.equal(wrapperNames.size, Object.keys(EXPECTED_SLASH_COMMANDS).length);
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

function buildJob(approvalPolicy, workflowId = 'copy.social') {
  return createScheduledJob({
    job_id: `hermes-${workflowId}-${approvalPolicy.mode}`, workflow_id: workflowId, input: { product_slug: 'fixture-product' },
    schedule: { kind: 'cron', expression: '0 9 * * *' }, timezone: 'America/Manaus',
    idempotency_key: `idempotency-${workflowId}-${approvalPolicy.mode}`, approval_policy: approvalPolicy,
    destination: { kind: 'local' }, enabled: true,
  });
}

const standingContext = {
  workflow_id: 'copy.social', product: 'fixture-product', network: 'organic', action_type: 'content',
  action_id: 'fixture-action', now: '2029-06-01T00:00:00.000Z', usage: { runs: 1 },
};
const standingCron = toHermesCronJob(buildJob({
  mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture-user',
}), standingContext);
assert.equal(standingCron.timezone, 'America/Manaus');
assert.equal(standingCron.idempotency_key, 'idempotency-copy.social-standing');
assert.equal(standingCron.workdir, root);
assert.equal(standingCron.external_capability_granted, false);
assert.equal(standingCron.eligible_for_schedule, true);
assert.equal(standingCron.scheduled, false);

const noAuthorizationCron = toHermesCronJob(buildJob({ mode: 'standing', workflow_id: 'copy.social' }), standingContext);
assert.equal(noAuthorizationCron.eligible_for_schedule, false);
assert.equal(noAuthorizationCron.reason, 'approval_not_authorized');
const expiredCron = toHermesCronJob(buildJob({
  mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture-user', expires_at: '2029-01-01T00:00:00.000Z',
}), standingContext);
assert.equal(expiredCron.eligible_for_schedule, false);
assert.equal(expiredCron.reason, 'approval_expired');
const productMismatchCron = toHermesCronJob(buildJob({
  mode: 'standing', workflow_id: 'copy.social', product: 'fixture-product', authorized_by: 'fixture-user',
}), { ...standingContext, product: 'other-product' });
assert.equal(productMismatchCron.eligible_for_schedule, false);
assert.equal(productMismatchCron.reason, 'approval_product_mismatch');
const networkMismatchCron = toHermesCronJob(buildJob({
  mode: 'standing', workflow_id: 'copy.social', network: 'organic', authorized_by: 'fixture-user',
}), { ...standingContext, network: 'other-network' });
assert.equal(networkMismatchCron.eligible_for_schedule, false);
assert.equal(networkMismatchCron.reason, 'approval_network_mismatch');
const noUsageCron = toHermesCronJob(buildJob({
  mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture-user', limits: { runs: 1 },
}), { ...standingContext, usage: {} });
assert.equal(noUsageCron.eligible_for_schedule, false);
assert.equal(noUsageCron.reason, 'approval_limits_not_evaluated');
const exceededLimitCron = toHermesCronJob(buildJob({
  mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture-user', limits: { runs: 1 },
}), { ...standingContext, usage: { runs: 2 } });
assert.equal(exceededLimitCron.eligible_for_schedule, false);
assert.equal(exceededLimitCron.reason, 'approval_limit_exceeded:runs');

const disabledCron = toHermesCronJob(buildJob({ mode: 'disabled', workflow_id: 'copy.social' }), standingContext);
assert.equal(disabledCron.eligible_for_schedule, false);
assert.equal(disabledCron.reason, 'approval_disabled');
const manualCron = toHermesCronJob(buildJob({ mode: 'manual', workflow_id: 'copy.social' }), standingContext);
assert.equal(manualCron.eligible_for_schedule, false);
assert.equal(manualCron.reason, 'manual_approval_required');
const externalCron = toHermesCronJob(buildJob({
  mode: 'standing', workflow_id: 'research.market', authorized_by: 'fixture-user',
}, 'research.market'), { ...standingContext, workflow_id: 'research.market' });
assert.equal(externalCron.eligible_for_schedule, false);
assert.equal(externalCron.reason, 'external_capability_blocked');
for (const descriptor of [standingCron, noAuthorizationCron, expiredCron, productMismatchCron, networkMismatchCron, noUsageCron, exceededLimitCron, disabledCron, manualCron, externalCron]) {
  assert.equal(descriptor.scheduled, false);
  assert.equal(descriptor.mode, 'dry_run');
}

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
assert.equal(fs.existsSync(path.join(root, 'adapters/hermes/SOURCE-POLICY.md')), true);

process.stdout.write('Hermes adapter contracts: ok\n');
