'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');

function resolveClaudeWorkflow(workflowId) {
  const workflow = workflowRegistry.get(workflowId);
  return Object.freeze({
    workflow_id: workflow.id,
    runtime: 'claude',
    target: Object.freeze({ ...workflow.source }),
    executable: false,
  });
}

module.exports = { resolveClaudeWorkflow };
