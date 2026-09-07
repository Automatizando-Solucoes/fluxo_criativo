'use strict';

const { workflowRegistry } = require('../../core/workflows/registry');
const { requiresChildRiskResolution } = require('../../core/contracts/workflow');
const { LOCAL_WORKFLOW_SUPPORT } = require('./local-workflows');
const { EXTERNAL_DRY_RUN_WORKFLOWS } = require('./external-workflows');
const { ORCHESTRATION_WORKFLOW_SUPPORT } = require('./orchestration-workflows');

const WRAPPER_PATHS = Object.freeze({
  'research.market': 'adapters/hermes/skills/research-market/SKILL.md',
  'copy.page': 'adapters/hermes/skills/copy-page/SKILL.md',
  'copy.ad': 'adapters/hermes/skills/copy-ad/SKILL.md',
  'copy.social': 'adapters/hermes/skills/copy-social/SKILL.md',
  'copy.script': 'adapters/hermes/skills/copy-script/SKILL.md',
  'product.create': 'adapters/hermes/skills/product-create/SKILL.md',
  'product.select': 'adapters/hermes/skills/product-select/SKILL.md',
  'funnel.low_ticket': 'adapters/hermes/skills/funnel-low-ticket/SKILL.md',
  'funnel.middle_ticket': 'adapters/hermes/skills/funnel-middle-ticket/SKILL.md',
  'page.sales': 'adapters/hermes/skills/page-sales/SKILL.md',
  'carousel.generate': 'adapters/hermes/skills/carousel-generate/SKILL.md',
  'carousel.schedule': 'adapters/hermes/skills/carousel-schedule/SKILL.md',
  'commercial.playbook': 'adapters/hermes/skills/commercial-playbook/SKILL.md',
  'creative.static': 'adapters/hermes/skills/creative-static/SKILL.md',
  'image.generate': 'adapters/hermes/skills/image-generate/SKILL.md',
  'video.generate': 'adapters/hermes/skills/video-generate/SKILL.md',
  'social.dashboard': 'adapters/hermes/skills/social-dashboard/SKILL.md',
  'ads.campaign.create': 'adapters/hermes/skills/ads-campaign-create/SKILL.md',
  'ads.optimize': 'adapters/hermes/skills/ads-optimize/SKILL.md',
  'ads.scale': 'adapters/hermes/skills/ads-scale/SKILL.md',
  'ads.report': 'adapters/hermes/skills/ads-report/SKILL.md',
  'ads.insights': 'adapters/hermes/skills/traffic-insights/SKILL.md',
  'plan.execute': 'adapters/hermes/skills/plan-execute/SKILL.md',
  'toolkit.execute': 'adapters/hermes/skills/toolkit-execute/SKILL.md',
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
  const localSupport = LOCAL_WORKFLOW_SUPPORT[workflow.id] || ORCHESTRATION_WORKFLOW_SUPPORT[workflow.id] || null;
  const externalDryRunSupport = EXTERNAL_DRY_RUN_WORKFLOWS.includes(workflow.id) || ['ads.insights', 'ads.campaign.create', 'ads.optimize', 'ads.scale', 'ads.report'].includes(workflow.id);
  return Object.freeze({
    requested_workflow_id: requestedWorkflow.id,
    workflow_id: workflow.id,
    compatibility_alias_of: requestedWorkflow.id === workflow.id ? null : workflow.id,
    runtime: 'hermes',
    target: Object.freeze({ kind: 'hermes.skill', path: wrapperPath }),
    requires_child_risk_resolution: requiresChildRiskResolution(workflow),
    risk_from_children: workflow.risk_from_children,
    external: workflow.side_effects.external,
    financial: workflow.side_effects.financial,
    approval_required: workflow.approval.required,
    support_status: localSupport ? localSupport.support_status : 'HERMES_EXTERNAL_DRY_RUN',
    mode: localSupport ? localSupport.mode : 'dry_run',
    local_executable: Boolean(localSupport) || externalDryRunSupport,
    external_executable: false,
    executable: Boolean(localSupport) || externalDryRunSupport,
  });
}

module.exports = { WRAPPER_PATHS, WORKFLOW_ALIASES, HermesWorkflowNotSupportedError, resolveHermesWorkflow };
