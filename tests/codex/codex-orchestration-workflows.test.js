#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict'); const { resolveCodexPlan, createCodexToolkit } = require('../../adapters/codex/workflows');
const plan = resolveCodexPlan([{ task_id: 'local', workflow_id: 'copy.social' }, { task_id: 'unknown', workflow_id: 'unknown.workflow' }, { task_id: 'scale', workflow_id: 'ads.scale' }]).result;
assert.equal(plan.tasks.find((task) => task.task_id === 'local').status, 'pending'); assert.equal(plan.tasks.find((task) => task.task_id === 'unknown').reason, 'unknown_workflow'); assert.equal(plan.tasks.find((task) => task.task_id === 'scale').status, 'blocked');
assert.throws(() => resolveCodexPlan([{ task_id: 'shell', workflow_id: 'copy.social', shell: 'echo unsafe' }]));
assert.throws(() => createCodexToolkit({ projectRoot: '/tmp', product_slug: '../escape', toolkit_id: 'x', tasks: [] }));
process.stdout.write('Codex orchestration workflows: ok\n');
