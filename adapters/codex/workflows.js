'use strict';

const local = require('../../core/local/workflows');
const plan = require('../../core/orchestration/plan');
const toolkit = require('../../core/orchestration/toolkit');
const publisher = require('../../core/external/organic-publisher');
const { workflowRegistry } = require('../../core/workflows/registry');
const { codexStatus } = require('./parity');

function codexResult(workflow_id, result) { const workflow = workflowRegistry.get(workflow_id); return Object.freeze({ workflow_id, runtime: 'codex', support_status: codexStatus(workflow_id), local_executable: codexStatus(workflow_id) !== 'CODEX_LEGACY', external_executable: false, external: workflow.side_effects.external, financial: workflow.side_effects.financial, approval_required: workflow.approval.required, result }); }
function resolveCodexPlan(tasks) { return codexResult('plan.execute', plan.resolvePlan(tasks, workflowRegistry)); }
function createCodexToolkit(input) { return codexResult('toolkit.execute', toolkit.createProductToolkit({ ...input, id: input.toolkit_id, registry: workflowRegistry })); }
function evaluateCodexPublication(input) { const request = input.request || publisher.createPublicationRequest(input); return codexResult('social.publish', publisher.evaluatePublication(request)); }
function createCodexLocal(input) {
  const handlers = { 'product.create': () => local.createProduct({ projectRoot: input.projectRoot, slug: input.product_slug, name: input.name, type: input.type, price: input.price }), 'product.select': () => local.activateProduct({ projectRoot: input.projectRoot, slug: input.product_slug }), 'carousel.generate': () => local.createCarouselArtifact(input), 'carousel.schedule': () => local.createCarouselSchedule(input), 'commercial.playbook': () => local.planCommercial(input), 'funnel.low_ticket': () => local.createLowTicketPlan(input), 'funnel.middle_ticket': () => local.createMiddleTicketPlan(input) };
  if (input.workflow_id.startsWith('copy.')) { const review = local.reviewCopy({ workflow_id: input.workflow_id, content: input.content }); return codexResult(input.workflow_id, local.saveReviewedCopy({ ...input, review })); }
  if (input.workflow_id === 'page.sales') return codexResult(input.workflow_id, local.buildPage(input));
  if (!handlers[input.workflow_id]) throw new TypeError(`unsupported Codex local workflow: ${input.workflow_id}`);
  return codexResult(input.workflow_id, handlers[input.workflow_id]());
}
module.exports = { codexResult, createCodexLocal, resolveCodexPlan, createCodexToolkit, evaluateCodexPublication };
