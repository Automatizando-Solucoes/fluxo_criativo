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
const { REQUIRED_HT_COMMANDS } = require('../../core/external/high-ticket-status');
const { PLATFORMS } = require('../../core/external/organic-publisher');
const { createScheduledJob } = require('../../core/scheduling/job');
const { createProduct } = require('../../core/local/workflows');
const { getHermesHighTicketStatus } = require('../../adapters/hermes/high-ticket-status');
const { createHermesToolkit, resolveHermesPlan } = require('../../adapters/hermes/orchestration-workflows');
const { createHermesPublicationRequest, evaluateHermesPublication } = require('../../adapters/hermes/publisher-workflow');
const { resolveHermesWorkflow } = require('../../adapters/hermes/resolver');
const { toHermesCronJob } = require('../../adapters/hermes/scheduling/cron');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-blocked-'));
const productSlug = 'produto-bloqueado';
const counters = { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 };
const original = {
  fetch: global.fetch, httpRequest: http.request, httpGet: http.get, httpsRequest: https.request, httpsGet: https.get, netConnect: net.connect,
  child: Object.fromEntries(['exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'execFileSync', 'fork'].map((name) => [name, childProcess[name]])),
  fs: Object.fromEntries(['writeFileSync', 'appendFileSync', 'renameSync', 'mkdirSync', 'rmSync'].map((name) => [name, fs[name]])),
};
function blockNetwork() { counters.network_calls += 1; throw new Error('network forbidden'); }
function blockChild() { counters.child_process_calls += 1; throw new Error('child process forbidden'); }
function guardWrite(target) { const resolved = path.resolve(String(target)); if (resolved !== fixture && !resolved.startsWith(`${fixture}${path.sep}`)) { counters.writes_outside_fixture += 1; throw new Error(`write outside fixture: ${resolved}`); } }
function installGuards() { if (typeof global.fetch === 'function') global.fetch = blockNetwork; http.request = blockNetwork; http.get = blockNetwork; https.request = blockNetwork; https.get = blockNetwork; net.connect = blockNetwork; for (const name of Object.keys(original.child)) childProcess[name] = blockChild; fs.writeFileSync = (target, ...args) => { guardWrite(target); return original.fs.writeFileSync(target, ...args); }; fs.appendFileSync = (target, ...args) => { guardWrite(target); return original.fs.appendFileSync(target, ...args); }; fs.renameSync = (from, to, ...args) => { guardWrite(from); guardWrite(to); return original.fs.renameSync(from, to, ...args); }; fs.mkdirSync = (target, ...args) => { guardWrite(target); return original.fs.mkdirSync(target, ...args); }; fs.rmSync = (target, ...args) => { guardWrite(target); return original.fs.rmSync(target, ...args); }; }
function restoreGuards() { global.fetch = original.fetch; http.request = original.httpRequest; http.get = original.httpGet; https.request = original.httpsRequest; https.get = original.httpsGet; net.connect = original.netConnect; for (const [name, value] of Object.entries(original.child)) childProcess[name] = value; for (const [name, value] of Object.entries(original.fs)) fs[name] = value; }
function manual(actionId) { return createApprovalPolicy({ mode: 'manual', workflow_id: 'social.publish', manual_grant: { action_id: actionId, approved_by: 'fixture', approved_at: '2026-09-07T00:00:00.000Z' } }); }
function publication(platform, approvalPolicy, autopublish = false) { return createHermesPublicationRequest({ publication_id: `pub-${platform}`, workflow_id: 'social.publish', product: productSlug, platform, content_type: 'carousel', artifact_path: `entregas/conteudo-social/${platform}.json`, approval_policy: approvalPolicy, autopublish }); }

installGuards();
try {
  createProduct({ projectRoot: fixture, slug: productSlug, name: 'Produto bloqueado', type: 'Low Ticket', price: 'R$47' });
  for (const platform of Object.keys(PLATFORMS)) {
    const request = publication(platform, manual(`pub-${platform}`));
    assert.equal(request.request.autopublish, false);
    const result = evaluateHermesPublication(request);
    assert.equal(result.support_status, 'HERMES_BLOCKED_EXTERNAL'); assert.equal(result.local_executable, true); assert.equal(result.external_executable, false);
    assert.equal(result.result.status, 'blocked'); assert.equal(result.result.error, 'official_publisher_adapter_absent'); assert.equal(result.result.external_id, null); assert.equal(result.result.published_at, null); assert.equal(result.result.published, false); assert.equal(result.result.dry_run, true);
  }
  assert.throws(() => publication('mastodon', manual('pub-mastodon')), /unknown publication platform/);
  assert.throws(() => createHermesPublicationRequest({ publication_id: 'bad', workflow_id: 'social.publish', product: productSlug, platform: 'instagram', content_type: 'post', artifact_path: 'a.md', approval_policy: manual('bad'), force_publish: true }), /forbidden/);
  const noGrant = publication('instagram', createApprovalPolicy({ mode: 'manual', workflow_id: 'social.publish' }));
  assert.equal(evaluateHermesPublication(noGrant).result.error, 'manual_grant_required');
  const wrongGrant = publication('instagram', manual('other-action'));
  assert.equal(evaluateHermesPublication(wrongGrant).result.error, 'manual_action_mismatch');
  const wrongScope = publication('instagram', createApprovalPolicy({ mode: 'standing', workflow_id: 'social.publish', product: 'other-product', network: 'instagram', action_type: 'publish', authorized_by: 'fixture' }));
  assert.equal(evaluateHermesPublication(wrongScope).result.error, 'product_mismatch');
  const standing = publication('instagram', createApprovalPolicy({ mode: 'standing', workflow_id: 'social.publish', product: productSlug, network: 'instagram', action_type: 'publish', authorized_by: 'fixture' }));
  assert.equal(evaluateHermesPublication(standing).result.error, 'official_publisher_adapter_absent');
  const autopublish = publication('facebook', manual('pub-facebook'), true);
  const autopublishResult = evaluateHermesPublication(autopublish).result;
  assert.equal(autopublish.request.autopublish, true); assert.equal(autopublishResult.status, 'blocked'); assert.equal(autopublishResult.published, false); assert.equal(autopublishResult.external_id, null);

  const planWithoutApproval = resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'publish', workflow_id: 'social.publish', action_id: 'pub-plan' }] });
  assert.equal(planWithoutApproval.result.tasks[0].reason, 'approval_required');
  const planWithApproval = resolveHermesPlan({ product_slug: productSlug, tasks: [{ task_id: 'publish', workflow_id: 'social.publish', action_id: 'pub-plan', approval_policy: manual('pub-plan') }] });
  assert.equal(planWithApproval.result.tasks[0].status, 'pending'); assert.equal(planWithApproval.result.tasks[0].external, true);
  const toolkit = createHermesToolkit({ projectRoot: fixture, product_slug: productSlug, toolkit_id: 'publisher', tasks: [{ id: 'publish', workflow_id: 'social.publish', action_id: 'pub-toolkit', approval_policy: manual('pub-toolkit') }] });
  assert.equal(toolkit.result.state.tasks[0].status, 'pending'); assert.equal(toolkit.result.state.tasks[0].external, true); assert.equal(toolkit.result.state.tasks[0].external_executable, false);

  const cron = toHermesCronJob(createScheduledJob({ job_id: 'publisher-job', workflow_id: 'social.publish', input: { product_slug: productSlug }, schedule: { kind: 'cron', expression: '0 9 * * *' }, timezone: 'America/Manaus', idempotency_key: 'publisher-key', approval_policy: createApprovalPolicy({ mode: 'standing', workflow_id: 'social.publish', product: productSlug, network: 'instagram', action_type: 'publish', authorized_by: 'fixture' }), destination: { kind: 'local' }, enabled: true }), { workflow_id: 'social.publish', product: productSlug, network: 'instagram', action_type: 'publish', action_id: 'pub-cron', usage: {} });
  assert.equal(cron.eligible_for_schedule, false); assert.equal(cron.scheduled, false); assert.equal(cron.reason, 'external_execution_unavailable');
  const resolvedPublisher = resolveHermesWorkflow('social.publish'); assert.equal(resolvedPublisher.support_status, 'HERMES_BLOCKED_EXTERNAL'); assert.equal(resolvedPublisher.local_executable, true); assert.equal(resolvedPublisher.external_executable, false); assert.equal(resolvedPublisher.mode, 'blocked_external');

  const htArtifacts = path.join(fixture, 'meus-produtos', productSlug, 'entregas', 'ht'); fs.mkdirSync(htArtifacts, { recursive: true }); fs.writeFileSync(path.join(htArtifacts, 'existente.md'), '# Preservar\n');
  const missingHt = getHermesHighTicketStatus({ projectRoot: fixture, product_slug: productSlug });
  assert.equal(missingHt.support_status, 'HERMES_BLOCKED_EXTERNAL'); assert.equal(missingHt.result.status, 'BLOCKED_EXTERNAL'); assert.equal(missingHt.result.code, 'c10x_skills_unavailable'); assert.equal(missingHt.result.missing_dependencies.length, REQUIRED_HT_COMMANDS.length); assert.deepEqual(missingHt.result.existing_artifacts, ['existente.md']); assert.equal(fs.existsSync(path.join(htArtifacts, 'existente.md')), true);
  for (const command of REQUIRED_HT_COMMANDS) { const target = path.join(fixture, '.claude', 'commands', `${command}.md`); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, '# fixture dependency\n'); }
  const completeHt = getHermesHighTicketStatus({ projectRoot: fixture, product_slug: productSlug }); assert.equal(completeHt.result.status, 'available'); assert.equal(completeHt.execution, 'not_implemented'); assert.equal(completeHt.external_executable, false);

  const serialized = JSON.stringify({ autopublishResult, missingHt, completeHt });
  assert.equal(/Bearer|Authorization|op:\/\/|access_token=|api_key=|token/i.test(serialized), false);
  assert.deepEqual(counters, { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 });
} finally { restoreGuards(); fs.rmSync(fixture, { recursive: true, force: true }); }

process.stdout.write('Hermes blocked workflows: ok\n');
