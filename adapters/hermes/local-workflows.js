'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');
const { assertProjectRoot } = require('../../core/state/product-state');
const { workflowRegistry } = require('../../core/workflows/registry');
const local = require('../../core/local/workflows');

const LOCAL_WORKFLOW_SUPPORT = Object.freeze({
  'product.create': Object.freeze({ support_status: 'HERMES_READY', mode: 'local' }),
  'product.select': Object.freeze({ support_status: 'HERMES_READY', mode: 'local' }),
  'copy.page': Object.freeze({ support_status: 'HERMES_READY', mode: 'local' }),
  'copy.ad': Object.freeze({ support_status: 'HERMES_READY', mode: 'local' }),
  'copy.social': Object.freeze({ support_status: 'HERMES_READY', mode: 'local' }),
  'copy.script': Object.freeze({ support_status: 'HERMES_READY', mode: 'local' }),
  'funnel.low_ticket': Object.freeze({ support_status: 'HERMES_EXTERNAL_DRY_RUN', mode: 'local_with_external_dry_run' }),
  'funnel.middle_ticket': Object.freeze({ support_status: 'HERMES_EXTERNAL_DRY_RUN', mode: 'local_with_external_dry_run' }),
  'page.sales': Object.freeze({ support_status: 'HERMES_READY', mode: 'local' }),
  'carousel.generate': Object.freeze({ support_status: 'HERMES_READY', mode: 'local' }),
  'commercial.playbook': Object.freeze({ support_status: 'HERMES_READY', mode: 'local' }),
});

function assertLocalWorkflow(workflowId) {
  if (!Object.hasOwn(LOCAL_WORKFLOW_SUPPORT, workflowId)) throw new TypeError(`unknown workflow or Hermes local support unavailable: ${workflowId}`);
  return workflowRegistry.get(workflowId);
}

function assertRequiredInputs(workflow, input) {
  for (const [name, contract] of Object.entries(workflow.inputs)) {
    if (contract.required && (input[name] === undefined || input[name] === null || input[name] === '')) {
      throw new TypeError(`${workflow.id} requires input: ${name}`);
    }
  }
}

function executeHermesLocalWorkflow(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('local workflow input must be an object');
  const workflow = assertLocalWorkflow(input.workflow_id);
  assertRequiredInputs(workflow, input);
  const projectRoot = assertProjectRoot(input.projectRoot);
  const support = LOCAL_WORKFLOW_SUPPORT[workflow.id];
  let result;

  switch (workflow.id) {
    case 'product.create': result = local.createProduct({ projectRoot, slug: input.product_slug, name: input.name, type: input.type, price: input.price }); break;
    case 'product.select': result = local.activateProduct({ projectRoot, slug: input.product_slug }); break;
    case 'copy.page':
    case 'copy.ad':
    case 'copy.social':
    case 'copy.script': {
      const review = local.reviewCopy({ workflow_id: workflow.id, content: input.content });
      result = local.saveReviewedCopy({ projectRoot, product_slug: input.product_slug, workflow_id: workflow.id, content: input.content, review });
      break;
    }
    case 'funnel.low_ticket': result = local.createLowTicketPlan({ projectRoot, product_slug: input.product_slug, quiz_required: input.quiz_required }); break;
    case 'funnel.middle_ticket': result = local.createMiddleTicketPlan({ projectRoot, product_slug: input.product_slug }); break;
    case 'page.sales': result = local.buildPage({ projectRoot, product_slug: input.product_slug, html: input.html, copy_review: input.copy_review }); break;
    case 'carousel.generate': result = local.createCarouselArtifact({ projectRoot, product_slug: input.product_slug, slug: input.slug, slides: input.slides, caption: input.caption, cta: input.cta, visual_prompts: input.visual_prompts }); break;
    case 'commercial.playbook': result = local.planCommercial({ product_slug: input.product_slug, module: input.module, existing_artifacts: input.existing_artifacts }); break;
    default: throw new TypeError(`Hermes local workflow is not supported: ${workflow.id}`);
  }

  const publication = workflow.id === 'copy.social'
    ? Object.freeze({ autopublish: false, status: 'not_requested' })
    : null;
  return immutableCopy({
    workflow_id: workflow.id,
    runtime: 'hermes',
    support_status: support.support_status,
    mode: support.mode,
    local_executable: true,
    external_executable: false,
    external: workflow.side_effects.external,
    financial: workflow.side_effects.financial,
    approval_required: workflow.approval.required,
    publication,
    result,
  });
}

module.exports = { LOCAL_WORKFLOW_SUPPORT, executeHermesLocalWorkflow };
