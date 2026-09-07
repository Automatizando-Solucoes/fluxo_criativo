#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const { workflowRegistry } = require('../../core/workflows/registry');
const { createApprovalPolicy } = require('../../core/approvals/policy');
const { resolvePlan, validateTask } = require('../../adapters/claude/plan-executor');

const local = validateTask({ task_id: 'copy', workflow_id: 'copy.social' }, workflowRegistry);
assert.equal(local.status, 'pending'); assert.equal(local.external, false); assert.equal(local.approval_required, false);
const createWithoutPolicy = validateTask({ task_id: 'create', workflow_id: 'ads.campaign.create', product_slug: 'produto' }, workflowRegistry);
assert.equal(createWithoutPolicy.status, 'blocked'); assert.equal(createWithoutPolicy.reason, 'approval_required'); assert.equal(createWithoutPolicy.external, true);
const scaleWithoutGrant = validateTask({ task_id: 'scale', workflow_id: 'ads.scale', product_slug: 'produto', action_id: 'scale-1', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.scale' }) }, workflowRegistry);
assert.equal(scaleWithoutGrant.reason, 'manual_grant_required'); assert.equal(scaleWithoutGrant.financial, true);
const wrongGrant = validateTask({ task_id: 'scale', workflow_id: 'ads.scale', product_slug: 'produto', action_id: 'scale-1', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.scale', manual_grant: { action_id: 'other', approved_by: 'operator', approved_at: '2026-09-07T00:00:00Z' } }) }, workflowRegistry);
assert.equal(wrongGrant.reason, 'manual_action_mismatch');
const correctGrant = validateTask({ task_id: 'scale', workflow_id: 'ads.scale', product_slug: 'produto', action_id: 'scale-1', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.scale', manual_grant: { action_id: 'scale-1', approved_by: 'operator', approved_at: '2026-09-07T00:00:00Z' } }) }, workflowRegistry);
assert.equal(correctGrant.status, 'pending'); assert.equal(correctGrant.financial, true); assert.equal(correctGrant.approval_status, 'manual');
assert.equal(validateTask({ task_id: 'wrong-scope', workflow_id: 'ads.campaign.create', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'copy.social' }), approval_context: { action_id: 'wrong-scope' } }, workflowRegistry).reason, 'workflow_mismatch');
assert.equal(validateTask({ task_id: 'b', workflow_id: 'unknown' }, workflowRegistry).reason, 'unknown_workflow');
assert.throws(() => validateTask({ task_id: 'c', workflow_id: 'copy.social', shell: 'rm -rf' }, workflowRegistry), /forbidden/);
assert.equal(validateTask({ task_id: 'composite', workflow_id: 'plan.execute' }, workflowRegistry).reason, 'child_tasks_required');
assert.equal(resolvePlan([{ task_id: 'a', workflow_id: 'copy.social' }, { task_id: 'b', workflow_id: 'bad' }], workflowRegistry).status, 'blocked');
process.stdout.write('Claude plan executor: ok\n');
