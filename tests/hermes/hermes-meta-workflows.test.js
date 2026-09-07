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
const { immutableCopy } = require('../../core/contracts/immutable');
const coreMeta = require('../../core/external/meta-ads');
const { createProduct } = require('../../core/local/workflows');
const { MockSecretProvider } = require('../../core/secrets/provider');
const claudeMeta = require('../../adapters/claude/meta-ads');
const {
  buildHermesAdsReport,
  createHermesCampaignDraft,
  createHermesReportDelivery,
  prepareHermesMetaOperation,
  prepareHermesMetaWorkflow,
} = require('../../adapters/hermes/meta-workflows');
const { resolveHermesWorkflow } = require('../../adapters/hermes/resolver');

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-meta-'));
const counters = { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 };
const original = {
  fetch: global.fetch,
  httpRequest: http.request,
  httpGet: http.get,
  httpsRequest: https.request,
  httpsGet: https.get,
  netConnect: net.connect,
  exec: childProcess.exec,
  execSync: childProcess.execSync,
  spawn: childProcess.spawn,
  spawnSync: childProcess.spawnSync,
  execFile: childProcess.execFile,
  execFileSync: childProcess.execFileSync,
  fork: childProcess.fork,
  writeFileSync: fs.writeFileSync,
  appendFileSync: fs.appendFileSync,
  renameSync: fs.renameSync,
  mkdirSync: fs.mkdirSync,
  rmSync: fs.rmSync,
};

function blockNetwork() {
  counters.network_calls += 1;
  throw new Error('network is forbidden in Hermes Meta parity tests');
}

function blockChildProcess() {
  counters.child_process_calls += 1;
  throw new Error('child process is forbidden in Hermes Meta parity tests');
}

function assertFixtureWrite(candidatePath) {
  const resolved = path.resolve(String(candidatePath));
  if (resolved !== fixtureRoot && !resolved.startsWith(`${fixtureRoot}${path.sep}`)) {
    counters.writes_outside_fixture += 1;
    throw new Error(`write outside fixture: ${resolved}`);
  }
}

function installGuards() {
  if (typeof global.fetch === 'function') global.fetch = blockNetwork;
  http.request = blockNetwork;
  http.get = blockNetwork;
  https.request = blockNetwork;
  https.get = blockNetwork;
  net.connect = blockNetwork;
  childProcess.exec = blockChildProcess;
  childProcess.execSync = blockChildProcess;
  childProcess.spawn = blockChildProcess;
  childProcess.spawnSync = blockChildProcess;
  childProcess.execFile = blockChildProcess;
  childProcess.execFileSync = blockChildProcess;
  childProcess.fork = blockChildProcess;
  fs.writeFileSync = (candidatePath, ...args) => {
    assertFixtureWrite(candidatePath);
    return original.writeFileSync(candidatePath, ...args);
  };
  fs.appendFileSync = (candidatePath, ...args) => {
    assertFixtureWrite(candidatePath);
    return original.appendFileSync(candidatePath, ...args);
  };
  fs.renameSync = (fromPath, toPath, ...args) => {
    assertFixtureWrite(fromPath);
    assertFixtureWrite(toPath);
    return original.renameSync(fromPath, toPath, ...args);
  };
  fs.mkdirSync = (candidatePath, ...args) => {
    assertFixtureWrite(candidatePath);
    return original.mkdirSync(candidatePath, ...args);
  };
  fs.rmSync = (candidatePath, ...args) => {
    assertFixtureWrite(candidatePath);
    return original.rmSync(candidatePath, ...args);
  };
}

function restoreGuards() {
  global.fetch = original.fetch;
  http.request = original.httpRequest;
  http.get = original.httpGet;
  https.request = original.httpsRequest;
  https.get = original.httpsGet;
  net.connect = original.netConnect;
  childProcess.exec = original.exec;
  childProcess.execSync = original.execSync;
  childProcess.spawn = original.spawn;
  childProcess.spawnSync = original.spawnSync;
  childProcess.execFile = original.execFile;
  childProcess.execFileSync = original.execFileSync;
  childProcess.fork = original.fork;
  fs.writeFileSync = original.writeFileSync;
  fs.appendFileSync = original.appendFileSync;
  fs.renameSync = original.renameSync;
  fs.mkdirSync = original.mkdirSync;
  fs.rmSync = original.rmSync;
}

function manualPolicy(workflowId, actionId) {
  return createApprovalPolicy({
    mode: 'manual', workflow_id: workflowId,
    manual_grant: { action_id: actionId, approved_by: 'fixture-operator', approved_at: '2026-09-07T00:00:00.000Z' },
  });
}

installGuards();
try {
  const secretProvider = new MockSecretProvider({ META_ACCESS_TOKEN: 'op://fixture/meta/instance-token' });
  assert.equal(claudeMeta.prepareMetaOperation, coreMeta.prepareMetaOperation);
  const readOperations = [
    'meta.auth.validate', 'meta.accounts.list', 'ads.account.read', 'ads.campaigns.list',
    'ads.pixels.list', 'ads.conversions.list', 'ads.audiences.list', 'ads.interests.search',
    'ads.creatives.validate', 'ads.insights',
  ];
  for (const operation of readOperations) {
    const result = prepareHermesMetaOperation({ operation, auth_mode: 'MCP_CONECTOR' }).result;
    assert.equal(result.status, 'dry_run');
    assert.equal(result.financial, false);
    assert.equal(result.approval_required, false);
    assert.equal(result.secret_name, null);
    assert.equal(result.transport, 'mcp');
    assert.equal(result.oauth_managed_externally, true);
  }
  assert.equal(prepareHermesMetaOperation({ operation: 'meta.auth.validate', auth_mode: 'APP' }).result.reason, 'secret_unavailable');
  assert.equal(prepareHermesMetaOperation({ operation: 'meta.auth.validate', auth_mode: 'APP', secretProvider }).result.status, 'dry_run');

  const createContext = { workflow_id: 'ads.campaign.create', action_id: 'create' };
  assert.equal(prepareHermesMetaWorkflow({ workflow_id: 'ads.campaign.create', context: createContext, secretProvider }).result.reason, 'approval_required');
  assert.equal(prepareHermesMetaWorkflow({ workflow_id: 'ads.campaign.create', policy: manualPolicy('ads.campaign.create', 'wrong'), context: createContext, secretProvider }).result.status, 'blocked');
  assert.equal(prepareHermesMetaWorkflow({ workflow_id: 'ads.campaign.create', policy: manualPolicy('ads.campaign.create', 'create'), context: createContext, secretProvider }).result.status, 'dry_run');
  const campaignDraft = createHermesCampaignDraft({ name: 'Campanha fixture', action_id: 'create' });
  assert.equal(campaignDraft.draft.status, 'PAUSED');
  assert.notEqual(campaignDraft.draft.status, 'ACTIVE');

  for (const operation of ['ads.optimize', 'ads.campaign.update_status']) {
    assert.equal(prepareHermesMetaOperation({ operation, policy: manualPolicy(operation, 'typed-action'), context: { workflow_id: operation, action_id: 'typed-action' }, secretProvider }).result.status, 'dry_run');
  }

  const scaleContext = { workflow_id: 'ads.scale', action_id: 'scale' };
  assert.equal(prepareHermesMetaWorkflow({ workflow_id: 'ads.scale', context: scaleContext, secretProvider }).result.reason, 'approval_required');
  assert.equal(prepareHermesMetaWorkflow({ workflow_id: 'ads.scale', policy: createApprovalPolicy({ mode: 'standing', workflow_id: 'ads.scale', authorized_by: 'fixture' }), context: scaleContext, secretProvider }).result.reason, 'manual_approval_required');
  assert.equal(prepareHermesMetaWorkflow({ workflow_id: 'ads.scale', policy: manualPolicy('ads.scale', 'wrong'), context: scaleContext, secretProvider }).result.status, 'blocked');
  assert.equal(prepareHermesMetaWorkflow({ workflow_id: 'ads.scale', policy: manualPolicy('ads.scale', 'scale'), context: scaleContext, secretProvider }).result.status, 'dry_run');
  assert.equal(prepareHermesMetaWorkflow({ workflow_id: 'ads.scale', auth_mode: 'MCP_CONECTOR', policy: manualPolicy('ads.scale', 'scale'), context: scaleContext }).result.status, 'dry_run');

  createProduct({ projectRoot: fixtureRoot, slug: 'produto', name: 'Produto fixture', type: 'Low Ticket', price: 'R$47' });
  const report = buildHermesAdsReport({ projectRoot: fixtureRoot, product_slug: 'produto', period: '2026-09', metrics: { spend: 0 }, analysis: 'Análise mock.' });
  assert.equal(report.result.delivery, null);
  assert.equal(report.result.artifact_path.startsWith(path.join(fixtureRoot, 'meus-produtos', 'produto')), true);
  const delivery = createHermesReportDelivery({ channel: 'telegram', artifact_path: report.result.artifact_path });
  assert.equal(delivery.sent, false);
  assert.equal(delivery.dry_run, true);

  for (const workflowId of ['ads.insights', 'ads.campaign.create', 'ads.optimize', 'ads.scale', 'ads.report']) {
    const resolved = resolveHermesWorkflow(workflowId);
    assert.equal(resolved.support_status, 'HERMES_EXTERNAL_DRY_RUN');
    assert.equal(resolved.local_executable, true);
    assert.equal(resolved.external_executable, false);
  }
  const alias = resolveHermesWorkflow('traffic.insights');
  assert.equal(alias.workflow_id, 'ads.insights');
  assert.equal(alias.compatibility_alias_of, 'ads.insights');
  const serialized = JSON.stringify(immutableCopy({ campaignDraft, report, delivery }));
  assert.equal(/op:\/\/|Bearer|EAA|access_token=|Authorization/i.test(serialized), false);
  assert.deepEqual(counters, { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 });
} finally {
  restoreGuards();
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

process.stdout.write('Hermes Meta workflow parity: ok\n');
