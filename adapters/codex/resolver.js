'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');
const { requiresChildRiskResolution } = require('../../core/contracts/workflow');

function resolveCodexWorkflow(workflowId) {
  const workflow = workflowRegistry.get(workflowId);
  return Object.freeze({
    workflow_id: workflow.id,
    runtime: 'codex',
    target: Object.freeze({ kind: 'codex.guided-workflow', status: 'not_implemented' }),
    requires_child_risk_resolution: requiresChildRiskResolution(workflow),
    executable: false,
  });
}

module.exports = { resolveCodexWorkflow };
