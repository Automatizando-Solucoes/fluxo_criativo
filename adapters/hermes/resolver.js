'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');
const { requiresChildRiskResolution } = require('../../core/contracts/workflow');

const WRAPPER_PATHS = Object.freeze({
  'research.market': 'adapters/hermes/skills/research-market/SKILL.md',
  'copy.page': 'adapters/hermes/skills/copy-page/SKILL.md',
  'copy.ad': 'adapters/hermes/skills/copy-ad/SKILL.md',
  'copy.social': 'adapters/hermes/skills/copy-social/SKILL.md',
  'creative.static': 'adapters/hermes/skills/creative-static/SKILL.md',
  'ads.insights': 'adapters/hermes/skills/traffic-insights/SKILL.md',
});

const WORKFLOW_ALIASES = Object.freeze({
  'traffic.insights': 'ads.insights',
});

class HermesWorkflowNotSupportedError extends Error {
  constructor(workflow) {
    super(`Hermes wrapper is not available for workflow: ${workflow.id}`);
    this.name = 'HermesWorkflowNotSupportedError';
    this.workflow_id = workflow.id;
    this.requires_child_risk_resolution = requiresChildRiskResolution(workflow);
  }
}

function resolveHermesWorkflow(workflowId) {
  const requestedWorkflow = workflowRegistry.get(workflowId);
  const canonicalWorkflowId = WORKFLOW_ALIASES[requestedWorkflow.id] || requestedWorkflow.id;
  const workflow = workflowRegistry.get(canonicalWorkflowId);
  const wrapperPath = WRAPPER_PATHS[workflow.id];
  if (!wrapperPath) throw new HermesWorkflowNotSupportedError(workflow);
  return Object.freeze({
    requested_workflow_id: requestedWorkflow.id,
    workflow_id: workflow.id,
    compatibility_alias_of: requestedWorkflow.id === workflow.id ? null : workflow.id,
    runtime: 'hermes',
    target: Object.freeze({ kind: 'hermes.skill', path: wrapperPath }),
    requires_child_risk_resolution: requiresChildRiskResolution(workflow),
    mode: 'dry_run',
    executable: false,
  });
}

module.exports = { WRAPPER_PATHS, WORKFLOW_ALIASES, HermesWorkflowNotSupportedError, resolveHermesWorkflow };
