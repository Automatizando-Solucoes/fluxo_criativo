'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');

function resolveHermesWorkflow(workflowId) {
  const workflow = workflowRegistry.get(workflowId);
  return Object.freeze({
    workflow_id: workflow.id,
    runtime: 'hermes',
    target: Object.freeze({ kind: 'hermes.workflow-wrapper', status: 'not_implemented' }),
    executable: false,
  });
}

module.exports = { resolveHermesWorkflow };
