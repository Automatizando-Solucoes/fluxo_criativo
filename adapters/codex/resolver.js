'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');

function resolveCodexWorkflow(workflowId) {
  const workflow = workflowRegistry.get(workflowId);
  return Object.freeze({
    workflow_id: workflow.id,
    runtime: 'codex',
    target: Object.freeze({ kind: 'codex.guided-workflow', status: 'not_implemented' }),
    executable: false,
  });
}

module.exports = { resolveCodexWorkflow };
