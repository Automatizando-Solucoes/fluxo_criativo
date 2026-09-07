'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');
const toolkit = require('../../core/orchestration/toolkit');

function createToolkit(root, id, tasks, registry = workflowRegistry) {
  return toolkit.createToolkit(root, id, tasks, registry);
}

function reevaluateTask(root, id, taskId, update, registry = workflowRegistry) {
  return toolkit.reevaluateTask(root, id, taskId, update, registry);
}

module.exports = { ...toolkit, createToolkit, reevaluateTask };
