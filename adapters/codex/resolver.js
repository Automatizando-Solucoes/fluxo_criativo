'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');
const { requiresChildRiskResolution } = require('../../core/contracts/workflow');
const { codexStatus } = require('./parity');

const WORKFLOW_ALIASES = Object.freeze({ 'traffic.insights': 'ads.insights' });

function resolveCodexWorkflow(workflowId) {
  const requested = workflowRegistry.get(workflowId);
  const workflow = workflowRegistry.get(WORKFLOW_ALIASES[requested.id] || requested.id);
  const status = codexStatus(requested.id);
  return Object.freeze({
    workflow_id: workflow.id,
    requested_workflow_id: requested.id,
    compatibility_alias_of: requested.id === workflow.id ? null : workflow.id,
    runtime: 'codex',
    target: Object.freeze({ kind: 'codex.workflow-contract', status }),
    requires_child_risk_resolution: requiresChildRiskResolution(workflow),
    external: workflow.side_effects.external,
    financial: workflow.side_effects.financial,
    approval_required: workflow.approval.required,
    support_status: status,
    // A blocked publisher still has a local request/evaluation boundary.
    local_executable: status !== 'CODEX_LEGACY',
    external_executable: false,
    executable: status !== 'CODEX_LEGACY' && status !== 'CODEX_BLOCKED_EXTERNAL',
  });
}

module.exports = { WORKFLOW_ALIASES, resolveCodexWorkflow };
