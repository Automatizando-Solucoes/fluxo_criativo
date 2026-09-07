#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const { MockSecretProvider } = require('../../core/secrets/provider');
const { createApprovalPolicy } = require('../../core/approvals/policy');
const { META_ACCESS_TOKEN, META_SECRET_ALIASES, prepareMetaOperation, createPausedCampaignDraft } = require('../../adapters/claude/meta-ads');

const secrets = new MockSecretProvider({ META_ACCESS_TOKEN: 'op://fixture/meta/token' });
const createContext = { workflow_id: 'ads.campaign.create', action_id: 'create-1' };
const manualCreate = createApprovalPolicy({
  mode: 'manual', workflow_id: 'ads.campaign.create',
  manual_grant: { action_id: 'create-1', approved_by: 'operator', approved_at: '2026-09-06T00:00:00Z' },
});
assert.equal(prepareMetaOperation({ operation: 'create_campaign', policy: manualCreate, context: createContext, secretProvider: secrets }).status, 'dry_run');

const draft = createPausedCampaignDraft({ name: 'Teste', action_id: 'create-1' });
assert.equal(draft.status, 'PAUSED');
assert.notEqual(draft.status, 'ACTIVE');

const scaleContext = { workflow_id: 'ads.scale', action_id: 'scale-1' };
const noGrant = createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.scale' });
assert.equal(prepareMetaOperation({ operation: 'scale', policy: noGrant, context: scaleContext, secretProvider: secrets }).status, 'blocked');
const wrongGrant = createApprovalPolicy({
  mode: 'manual', workflow_id: 'ads.scale',
  manual_grant: { action_id: 'other', approved_by: 'operator', approved_at: '2026-09-06T00:00:00Z' },
});
assert.equal(prepareMetaOperation({ operation: 'increase_budget', policy: wrongGrant, context: scaleContext, secretProvider: secrets }).status, 'blocked');
const correctGrant = createApprovalPolicy({
  mode: 'manual', workflow_id: 'ads.scale',
  manual_grant: { action_id: 'scale-1', approved_by: 'operator', approved_at: '2026-09-06T00:00:00Z' },
});
assert.equal(prepareMetaOperation({ operation: 'ads.scale', policy: correctGrant, context: scaleContext, secretProvider: secrets }).status, 'dry_run');

assert.equal(prepareMetaOperation({ operation: 'meta.auth.validate', secretProvider: secrets }).status, 'dry_run');
assert.equal(prepareMetaOperation({ operation: 'ads.scale', policy: noGrant, context: scaleContext, secretProvider: secrets }).status, 'blocked');
assert.equal(META_SECRET_ALIASES.ACCESS_TOKEN, META_ACCESS_TOKEN);
assert.equal(typeof secrets.get_secret, 'undefined');
process.stdout.write('Claude Meta Ads workflow: ok\n');
