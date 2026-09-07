#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict'); const { workflowRegistry } = require('../../core/workflows/registry'); const { MockSecretProvider } = require('../../core/secrets/provider'); const { resolveCodexWorkflow, WORKFLOW_ALIASES } = require('../../adapters/codex/resolver'); const { prepareCodexExternalWorkflow } = require('../../adapters/codex/external-workflows'); const { createCodexCampaignDraft, prepareCodexMetaWorkflow } = require('../../adapters/codex/meta-workflows');
assert.equal(workflowRegistry.list().length, 26); for (const workflow of workflowRegistry.list()) assert.match(resolveCodexWorkflow(workflow.id).support_status, /^CODEX_/);
assert.deepEqual(WORKFLOW_ALIASES, { 'traffic.insights': 'ads.insights' }); assert.equal(resolveCodexWorkflow('traffic.insights').workflow_id, 'ads.insights');
const secrets = new MockSecretProvider({ APIFY_API_TOKEN: 'op://fixture/apify/token', META_ACCESS_TOKEN: 'op://fixture/meta/token' });
assert.equal(prepareCodexExternalWorkflow({ workflow_id: 'research.market', provider: 'apify', secretProvider: secrets }).result.status, 'dry_run');
assert.equal(prepareCodexExternalWorkflow({ workflow_id: 'creative.static', brief: 'Brief seguro' }).external_executable, false);
assert.equal(prepareCodexMetaWorkflow({ workflow_id: 'ads.insights', auth_mode: 'MCP_CONECTOR' }).result.oauth_managed_externally, true);
assert.equal(createCodexCampaignDraft({ name: 'Fixture', action_id: 'fixture-action' }).draft.status, 'PAUSED');
process.stdout.write('Codex adapter: ok\n');
