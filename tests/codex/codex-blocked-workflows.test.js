#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict'); const { createApprovalPolicy } = require('../../core/approvals/policy'); const { evaluateCodexPublication } = require('../../adapters/codex/workflows'); const { resolveCodexWorkflow } = require('../../adapters/codex/resolver'); const { getCodexHighTicketStatus } = require('../../adapters/codex/high-ticket-status');
for (const platform of ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube']) {
  const publication_id = `fixture-${platform}`; const policy = createApprovalPolicy({ mode: 'manual', workflow_id: 'social.publish', manual_grant: { action_id: publication_id, approved_by: 'fixture', approved_at: '2026-09-07T00:00:00.000Z' } });
  const evaluated = evaluateCodexPublication({ publication_id, workflow_id: 'social.publish', product: 'produto', platform, content_type: 'post', artifact_path: 'meus-produtos/produto/entregas/post.md', autopublish: true, approval_policy: policy });
  assert.equal(evaluated.local_executable, true); assert.equal(evaluated.external_executable, false); assert.equal(evaluated.result.status, 'blocked'); assert.equal(evaluated.result.error, 'official_publisher_adapter_absent'); assert.equal(evaluated.result.published, false); assert.equal(evaluated.result.external_id, null);
}
assert.throws(() => evaluateCodexPublication({ publication_id: 'x', workflow_id: 'social.publish', product: 'p', platform: 'mastodon', content_type: 'post', artifact_path: 'a' }));
const resolution = resolveCodexWorkflow('social.publish'); assert.equal(resolution.support_status, 'CODEX_BLOCKED_EXTERNAL'); assert.equal(resolution.local_executable, true); assert.equal(resolution.external_executable, false);
assert.equal(getCodexHighTicketStatus({ projectRoot: '/tmp', product_slug: 'produto' }).result.status, 'BLOCKED_EXTERNAL');
process.stdout.write('Codex blocked workflows: ok\n');
