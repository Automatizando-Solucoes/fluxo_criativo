'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');
const { requiresChildRiskResolution } = require('../../core/contracts/workflow');

function resolveHermesWorkflow(workflowId) {
  const workflow = workflowRegistry.get(workflowId);
  return Object.freeze({
    workflow_id: workflow.id,
    runtime: 'hermes',
    target: Object.freeze({ kind: 'hermes.workflow-wrapper', status: 'not_implemented' }),
    requires_child_risk_resolution: requiresChildRiskResolution(workflow),
    executable: false,
  });
}

module.exports = { resolveHermesWorkflow };
