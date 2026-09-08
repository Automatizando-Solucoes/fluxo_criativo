#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { MockSecretProvider } = require('../../core/secrets/provider');
const { createApprovalPolicy } = require('../../core/approvals/policy');
const { createProduct } = require('../../core/local/workflows');
const { prepareCodexMetaOperation, prepareCodexMetaWorkflow, createCodexCampaignDraft, buildCodexAdsReport, createCodexReportDelivery } = require('../../adapters/codex/meta-workflows');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-meta-'));
const secretProvider = new MockSecretProvider({ META_ACCESS_TOKEN: 'op://fixture/meta/token' });
const manual = (workflow_id, action_id) => createApprovalPolicy({ mode: 'manual', workflow_id, manual_grant: { action_id, approved_by: 'fixture', approved_at: '2026-09-07T00:00:00.000Z' } });
try {
  const reads = ['meta.auth.validate', 'meta.accounts.list', 'ads.account.read', 'ads.campaigns.list', 'ads.pixels.list', 'ads.conversions.list', 'ads.audiences.list', 'ads.interests.search', 'ads.creatives.validate', 'ads.insights'];
  for (const operation of reads) { const result = prepareCodexMetaOperation({ operation, auth_mode: 'MCP_CONECTOR' }).result; assert.equal(result.status, 'dry_run'); assert.equal(result.transport, 'mcp'); assert.equal(result.secret_name, null); assert.equal(result.approval_required, false); }
  assert.equal(prepareCodexMetaOperation({ operation: 'meta.auth.validate', auth_mode: 'APP' }).result.reason, 'secret_unavailable');
  assert.equal(prepareCodexMetaOperation({ operation: 'meta.auth.validate', auth_mode: 'APP', secretProvider }).result.status, 'dry_run');
  const createContext = { workflow_id: 'ads.campaign.create', action_id: 'create' };
  assert.equal(prepareCodexMetaWorkflow({ workflow_id: 'ads.campaign.create', context: createContext, secretProvider }).result.status, 'blocked');
  assert.equal(prepareCodexMetaWorkflow({ workflow_id: 'ads.campaign.create', context: createContext, secretProvider, policy: manual('ads.campaign.create', 'create') }).result.status, 'dry_run');
  assert.equal(createCodexCampaignDraft({ name: 'fixture', action_id: 'create' }).draft.status, 'PAUSED');
  const scaleContext = { workflow_id: 'ads.scale', action_id: 'scale' };
  assert.equal(prepareCodexMetaWorkflow({ workflow_id: 'ads.scale', context: scaleContext, secretProvider, policy: createApprovalPolicy({ mode: 'standing', workflow_id: 'ads.scale', authorized_by: 'fixture' }) }).result.reason, 'manual_approval_required');
  assert.equal(prepareCodexMetaWorkflow({ workflow_id: 'ads.scale', context: scaleContext, secretProvider, policy: manual('ads.scale', 'scale') }).result.status, 'dry_run');
  assert.equal(prepareCodexMetaWorkflow({ workflow_id: 'ads.scale', auth_mode: 'MCP_CONECTOR', context: scaleContext, policy: manual('ads.scale', 'scale') }).result.status, 'dry_run');
  createProduct({ projectRoot: fixture, slug: 'produto', name: 'Produto', type: 'Low Ticket', price: 'R$47' });
  const report = buildCodexAdsReport({ projectRoot: fixture, product_slug: 'produto', period: '2026-09', metrics: { spend: 0 }, analysis: 'Mock.' });
  assert.equal(report.result.delivery, null); assert.equal(createCodexReportDelivery({ channel: 'telegram', artifact_path: report.result.artifact_path }).sent, false);
  assert.equal(/op:\/\/|Bearer|Authorization|access_token=/.test(JSON.stringify({ report })), false);
} finally { fs.rmSync(fixture, { recursive: true, force: true }); }
process.stdout.write('Codex Meta workflows: ok\n');
