'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');
const { requiresChildRiskResolution } = require('../../core/contracts/workflow');

const WRAPPER_PATHS = Object.freeze({
  'research.market': 'adapters/hermes/skills/research-market/SKILL.md',
  'copy.page': 'adapters/hermes/skills/copy-page/SKILL.md',
  'copy.ad': 'adapters/hermes/skills/copy-ad/SKILL.md',
  'copy.social': 'adapters/hermes/skills/copy-social/SKILL.md',
  'creative.static': 'adapters/hermes/skills/creative-static/SKILL.md',
  'traffic.insights': 'adapters/hermes/skills/traffic-insights/SKILL.md',
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
  const workflow = workflowRegistry.get(workflowId);
  const wrapperPath = WRAPPER_PATHS[workflow.id];
  if (!wrapperPath) throw new HermesWorkflowNotSupportedError(workflow);
  return Object.freeze({
    workflow_id: workflow.id,
    runtime: 'hermes',
    target: Object.freeze({ kind: 'hermes.skill', path: wrapperPath }),
    requires_child_risk_resolution: requiresChildRiskResolution(workflow),
    mode: 'dry_run',
    executable: false,
  });
}

module.exports = { WRAPPER_PATHS, HermesWorkflowNotSupportedError, resolveHermesWorkflow };
