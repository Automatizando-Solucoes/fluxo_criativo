'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');
const { requiresChildRiskResolution } = require('../../core/contracts/workflow');

function resolveClaudeWorkflow(workflowId) {
  const workflow = workflowRegistry.get(workflowId);
  return Object.freeze({
    workflow_id: workflow.id,
    runtime: 'claude',
    target: Object.freeze({ ...workflow.source }),
    requires_child_risk_resolution: requiresChildRiskResolution(workflow),
    executable: false,
  });
}

module.exports = { resolveClaudeWorkflow };
