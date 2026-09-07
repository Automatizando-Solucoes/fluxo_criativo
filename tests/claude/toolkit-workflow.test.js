#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict'); const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const { createApprovalPolicy } = require('../../core/approvals/policy'); const { createToolkit, transition, reevaluateTask } = require('../../adapters/claude/toolkit-workflow');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-'));
try {
  let toolkit = createToolkit(root, 'gates', [
    { id: 'copy', workflow_id: 'copy.social' },
    { id: 'create', workflow_id: 'ads.campaign.create' },
    { id: 'scale-missing', workflow_id: 'ads.scale', action_id: 'scale-1', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.scale' }) },
    { id: 'scale-wrong', workflow_id: 'ads.scale', action_id: 'scale-2', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.scale', manual_grant: { action_id: 'other', approved_by: 'operator', approved_at: '2026-09-07T00:00:00Z' } }) },
    { id: 'scale-ok', workflow_id: 'ads.scale', action_id: 'scale-3', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.scale', manual_grant: { action_id: 'scale-3', approved_by: 'operator', approved_at: '2026-09-07T00:00:00Z' } }) },
    { id: 'publish', workflow_id: 'social.publish' },
  ]);
  const byId = Object.fromEntries(toolkit.state.tasks.map((task) => [task.id, task]));
  assert.equal(byId.copy.status, 'pending'); assert.equal(byId.create.reason, 'approval_required'); assert.equal(byId['scale-missing'].status, 'blocked'); assert.equal(byId['scale-wrong'].status, 'blocked'); assert.equal(byId['scale-ok'].status, 'pending'); assert.equal(byId.publish.reason, 'approval_required'); assert.equal(byId['scale-ok'].financial, true); assert.equal(byId.create.external, true);
  toolkit = createToolkit(root, 'x', [{ id: 'a', workflow_id: 'copy.social' }, { id: 'b', workflow_id: 'copy.page', depends_on: ['a'] }]);
  let state = transition(root, 'x', 'a', 'running'); assert.equal(state.tasks[0].attempts, 1); state = transition(root, 'x', 'a', 'failed', { error: 'x' }); assert.throws(() => transition(root, 'x', 'b', 'running'), /blocked dependency/); assert.throws(() => transition(root, 'x', 'a', 'completed'), /explicit retry/);
  const updated = reevaluateTask(root, 'gates', 'create', { action_id: 'create-1', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.campaign.create', manual_grant: { action_id: 'create-1', approved_by: 'operator', approved_at: '2026-09-07T00:00:00Z' } }) });
  assert.equal(updated.tasks.find((task) => task.id === 'create').status, 'pending');
  assert.throws(() => createToolkit(root, 'unknown', [{ id: 'bad', workflow_id: 'not.registered' }]), /unknown workflow/);
  assert.throws(() => createToolkit(root, 'duplicate', [{ id: 'a', workflow_id: 'copy.social' }, { id: 'b', workflow_id: 'copy.page', idempotency_key: 'a' }]), /duplicate idempotency key/);
} finally { fs.rmSync(root, { recursive: true, force: true }); }
process.stdout.write('Claude toolkit workflow: ok\n');
