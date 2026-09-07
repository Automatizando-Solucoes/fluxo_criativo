#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const { createApprovalPolicy } = require('../../core/approvals/policy');
const corePlan = require('../../core/orchestration/plan');
const coreToolkit = require('../../core/orchestration/toolkit');
const { createScheduledJob } = require('../../core/scheduling/job');
const { createProduct } = require('../../core/local/workflows');
const claudePlan = require('../../adapters/claude/plan-executor');
const claudeToolkit = require('../../adapters/claude/toolkit-workflow');
const { createDelegateRequest, resolveDelegateRequest } = require('../../adapters/hermes/delegation');
const { createHermesCarouselSchedule, createHermesToolkit, pauseHermesToolkit, reevaluateHermesToolkit, resolveHermesPlan, resumeHermesToolkit, transitionHermesToolkit } = require('../../adapters/hermes/orchestration-workflows');
const { resolveHermesWorkflow } = require('../../adapters/hermes/resolver');
const { toHermesCronJob } = require('../../adapters/hermes/scheduling/cron');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-orchestration-'));
const productSlug = 'produto-fixture';
const counters = { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 };
const originals = {
  fetch: global.fetch, httpRequest: http.request, httpGet: http.get, httpsRequest: https.request, httpsGet: https.get, netConnect: net.connect,
  child: Object.fromEntries(['exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'execFileSync', 'fork'].map((name) => [name, childProcess[name]])),
  fs: Object.fromEntries(['writeFileSync', 'appendFileSync', 'renameSync', 'mkdirSync', 'rmSync'].map((name) => [name, fs[name]])),
};
function blockedNetwork() { counters.network_calls += 1; throw new Error('network forbidden'); }
function blockedChild() { counters.child_process_calls += 1; throw new Error('child process forbidden'); }
function assertFixtureWrite(target) { const resolved = path.resolve(String(target)); if (resolved !== fixture && !resolved.startsWith(`${fixture}${path.sep}`)) { counters.writes_outside_fixture += 1; throw new Error(`write outside fixture: ${resolved}`); } }
function installGuards() {
  if (typeof global.fetch === 'function') global.fetch = blockedNetwork;
  http.request = blockedNetwork; http.get = blockedNetwork; https.request = blockedNetwork; https.get = blockedNetwork; net.connect = blockedNetwork;
  for (const name of Object.keys(originals.child)) childProcess[name] = blockedChild;
  fs.writeFileSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.writeFileSync(target, ...args); };
  fs.appendFileSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.appendFileSync(target, ...args); };
  fs.renameSync = (from, to, ...args) => { assertFixtureWrite(from); assertFixtureWrite(to); return originals.fs.renameSync(from, to, ...args); };
  fs.mkdirSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.mkdirSync(target, ...args); };
  fs.rmSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.rmSync(target, ...args); };
}
function restoreGuards() { global.fetch = originals.fetch; http.request = originals.httpRequest; http.get = originals.httpGet; https.request = originals.httpsRequest; https.get = originals.httpsGet; net.connect = originals.netConnect; for (const [name, value] of Object.entries(originals.child)) childProcess[name] = value; for (const [name, value] of Object.entries(originals.fs)) fs[name] = value; }
function manual(workflowId, actionId) { return createApprovalPolicy({ mode: 'manual', workflow_id: workflowId, manual_grant: { action_id: actionId, approved_by: 'fixture', approved_at: '2026-09-07T00:00:00.000Z' } }); }
function cronInput(workflowId, policy) { return { job_id: `job-${workflowId.replaceAll('.', '-')}`, workflow_id: workflowId, input: { product_slug: productSlug }, schedule: { kind: 'cron', expression: '0 9 * * *' }, timezone: 'America/Manaus', idempotency_key: `key-${workflowId}`, approval_policy: policy, destination: { kind: 'local' }, enabled: true }; }
function cronContext(workflowId) { return { workflow_id: workflowId, product: productSlug, network: 'organic', action_type: 'content', action_id: 'fixture-action', now: '2026-09-07T00:00:00.000Z', usage: { runs: 1 } }; }

assert.equal(claudePlan.validateTask, corePlan.validateTask);
assert.equal(claudeToolkit.createProductToolkit, coreToolkit.createProductToolkit);
installGuards();
try {
  createProduct({ projectRoot: fixture, slug: productSlug, name: 'Produto Fixture', type: 'Low Ticket', price: 'R$47' });

  const localPlan = resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'copy', workflow_id: 'copy.social' }] });
  assert.equal(localPlan.result.tasks[0].status, 'pending'); assert.equal(localPlan.dispatch, 'not_requested');
  assert.equal(resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'unknown', workflow_id: 'missing.workflow' }] }).result.tasks[0].reason, 'unknown_workflow');
  assert.throws(() => resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'shell', workflow_id: 'copy.social', shell: 'echo unsafe' }] }), /forbidden/);
  assert.equal(resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'create', workflow_id: 'ads.campaign.create' }] }).result.tasks[0].reason, 'approval_required');
  assert.equal(resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'scale', workflow_id: 'ads.scale', action_id: 'scale', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.scale' }) }] }).result.tasks[0].reason, 'manual_grant_required');
  assert.equal(resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'scale', workflow_id: 'ads.scale', action_id: 'scale', approval_policy: manual('ads.scale', 'scale') }] }).result.tasks[0].status, 'pending');
  assert.equal(resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'composite', workflow_id: 'plan.execute' }] }).result.tasks[0].reason, 'child_tasks_required');
  assert.equal(resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'composite', workflow_id: 'plan.execute', children: [{ task_id: 'bad-child', workflow_id: 'bad' }] }] }).result.tasks[0].reason, 'child_blocked');
  assert.equal(resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'composite-scale', workflow_id: 'plan.execute', children: [{ task_id: 'scale-child', workflow_id: 'ads.scale', action_id: 'scale-child' }] }] }).result.tasks[0].reason, 'child_blocked');
  const chainedDependencies = resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'blocked-root', workflow_id: 'missing.workflow' }, { task_id: 'middle', workflow_id: 'copy.social', depends_on: ['blocked-root'] }, { task_id: 'leaf', workflow_id: 'copy.page', depends_on: ['middle'] }] }).result.tasks;
  assert.equal(chainedDependencies[1].reason, 'dependency_blocked'); assert.equal(chainedDependencies[2].reason, 'dependency_blocked');

  const toolkit = createHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'gates', tasks: [
    { id: 'copy', workflow_id: 'copy.social' }, { id: 'insights', workflow_id: 'ads.insights' },
    { id: 'create', workflow_id: 'ads.campaign.create' }, { id: 'scale', workflow_id: 'ads.scale', action_id: 'scale', approval_policy: manual('ads.scale', 'scale') },
    { id: 'unknown', workflow_id: 'not.registered' }, { id: 'dependent', workflow_id: 'copy.page', depends_on: ['unknown'] },
  ] });
  const tasks = Object.fromEntries(toolkit.result.state.tasks.map((task) => [task.id, task]));
  assert.equal(tasks.copy.status, 'pending'); assert.equal(tasks.insights.external, true); assert.equal(tasks.insights.external_executable, false);
  assert.equal(tasks.create.reason, 'approval_required'); assert.equal(tasks.scale.status, 'pending'); assert.equal(tasks.scale.financial, true);
  assert.equal(tasks.unknown.reason, 'unknown_workflow'); assert.equal(tasks.dependent.reason, 'dependency_blocked');
  assert.equal(toolkit.result.dir.startsWith(path.join(fixture, 'meus-produtos', productSlug, 'projeto')), true);
  assert.throws(() => createHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'duplicates', tasks: [{ id: 'a', workflow_id: 'copy.social' }, { id: 'b', workflow_id: 'copy.page', idempotency_key: 'a' }] }), /duplicate idempotency key/);
  assert.throws(() => createHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'missing-dependency', tasks: [{ id: 'a', workflow_id: 'copy.social', depends_on: ['absent'] }] }), /dependency not found/);
  assert.throws(() => createHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: '../escape', tasks: [] }), /slug/);

  createHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress', tasks: [{ id: 'one', workflow_id: 'copy.social' }, { id: 'two', workflow_id: 'copy.page', depends_on: ['one'] }] });
  pauseHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress' });
  assert.throws(() => transitionHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress', task_id: 'one', status: 'running' }), /paused/);
  resumeHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress' });
  let state = transitionHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress', task_id: 'one', status: 'running' });
  assert.equal(state.tasks[0].attempts, 1); state = transitionHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress', task_id: 'one', status: 'completed' });
  const repeated = transitionHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress', task_id: 'one', status: 'running' }); assert.equal(repeated.tasks[0].attempts, 1);
  transitionHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress', task_id: 'two', status: 'running' }); transitionHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress', task_id: 'two', status: 'failed', extra: { error: 'fixture failure' } });
  assert.throws(() => transitionHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress', task_id: 'two', status: 'running' }), /explicit retry/);
  state = transitionHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'progress', task_id: 'two', status: 'running', extra: { retry: true } }); assert.equal(state.tasks[1].attempts, 2);
  const rechecked = reevaluateHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'gates', task_id: 'create', update: { action_id: 'create', approval_policy: manual('ads.campaign.create', 'create') } }); assert.equal(rechecked.tasks.find((task) => task.id === 'create').status, 'pending');

  const schedule = createHermesCarouselSchedule({ projectRoot: fixture, product_slug: productSlug, slug: 'carrossel', schedule_id: 'carousel-1', schedule: '0 9 * * *', timezone: 'America/Manaus' });
  assert.equal(schedule.result.descriptor.schedule_id, 'carousel-1'); assert.equal(schedule.result.descriptor.publication, false); assert.equal(schedule.result.descriptor.relatorio_cron_id, null); assert.equal(schedule.scheduled, false);
  assert.throws(() => createHermesCarouselSchedule({ projectRoot: fixture, product_slug: productSlug, slug: 'bad-zone', schedule_id: 'bad', schedule: '0 9 * * *', timezone: 'Mars/Olympus' }), /timezone/);

  const standing = createApprovalPolicy({ mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture' });
  const localCron = toHermesCronJob(cronInput('copy.social', standing), cronContext('copy.social'));
  const scheduleCron = toHermesCronJob(cronInput('carousel.schedule', createApprovalPolicy({ mode: 'standing', workflow_id: 'carousel.schedule', authorized_by: 'fixture' })), cronContext('carousel.schedule'));
  const disabledCron = toHermesCronJob(cronInput('copy.social', createApprovalPolicy({ mode: 'disabled', workflow_id: 'copy.social' })), cronContext('copy.social'));
  const manualCron = toHermesCronJob(cronInput('copy.social', createApprovalPolicy({ mode: 'manual', workflow_id: 'copy.social' })), cronContext('copy.social'));
  const expiredCron = toHermesCronJob(cronInput('copy.social', createApprovalPolicy({ mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture', expires_at: '2026-09-01T00:00:00.000Z' })), cronContext('copy.social'));
  const revokedCron = toHermesCronJob(cronInput('copy.social', createApprovalPolicy({ mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture', revoked_at: '2026-09-01T00:00:00.000Z' })), cronContext('copy.social'));
  const limitedCron = toHermesCronJob(cronInput('copy.social', createApprovalPolicy({ mode: 'standing', workflow_id: 'copy.social', authorized_by: 'fixture', limits: { runs: 0 } })), cronContext('copy.social'));
  const financialCron = toHermesCronJob(cronInput('ads.scale', createApprovalPolicy({ mode: 'standing', workflow_id: 'ads.scale', authorized_by: 'fixture' })), cronContext('ads.scale'));
  const externalCron = toHermesCronJob(cronInput('ads.insights', createApprovalPolicy({ mode: 'standing', workflow_id: 'ads.insights', authorized_by: 'fixture' })), cronContext('ads.insights'));
  const publisherCron = toHermesCronJob(cronInput('social.publish', createApprovalPolicy({ mode: 'standing', workflow_id: 'social.publish', authorized_by: 'fixture' })), cronContext('social.publish'));
  assert.equal(localCron.eligible_for_schedule, true); assert.equal(scheduleCron.eligible_for_schedule, true); assert.equal(disabledCron.eligible_for_schedule, false); assert.equal(manualCron.eligible_for_schedule, false);
  assert.equal(expiredCron.eligible_for_schedule, false); assert.equal(revokedCron.eligible_for_schedule, false); assert.equal(limitedCron.eligible_for_schedule, false);
  assert.equal(financialCron.reason, 'financial_workflow_blocked'); assert.equal(externalCron.reason, 'external_execution_unavailable'); assert.equal(publisherCron.reason, 'external_execution_unavailable');
  const cronDescriptors = [localCron, scheduleCron, disabledCron, manualCron, expiredCron, revokedCron, limitedCron, financialCron, externalCron, publisherCron];
  assert.equal(cronDescriptors.filter((descriptor) => descriptor.scheduled).length, 0); assert.equal(cronDescriptors.every((descriptor) => descriptor.mode === 'dry_run'), true);
  assert.equal(localCron.idempotency_key, 'key-copy.social'); assert.equal(localCron.job_id, 'job-copy-social');

  const delegate = resolveDelegateRequest(createDelegateRequest({ delegate_id: 'review', agent: 'revisor-pesquisa', workflow_id: 'research.market', product_slug: productSlug, task: 'review local artifact', allowed_capabilities: ['filesystem.read'], input_paths: [`meus-produtos/${productSlug}/pesquisa-mercado.md`], output_contract: { type: 'review' } }));
  assert.equal(delegate.dispatched, false); assert.equal([delegate].filter((item) => item.dispatched).length, 0);
  for (const workflowId of ['plan.execute', 'toolkit.execute', 'carousel.schedule']) { const resolution = resolveHermesWorkflow(workflowId); assert.equal(resolution.support_status, 'HERMES_READY'); assert.equal(resolution.local_executable, true); assert.equal(resolution.external_executable, false); }
  assert.equal(resolveHermesWorkflow('plan.execute').risk_from_children, true); assert.equal(resolveHermesWorkflow('toolkit.execute').risk_from_children, true);
  assert.deepEqual(localCron.delivery, { kind: 'local' });
  assert.deepEqual(counters, { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 });
} finally { restoreGuards(); fs.rmSync(fixture, { recursive: true, force: true }); }

process.stdout.write('Hermes orchestration workflow parity: ok\n');
