'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');
const { getProductPath } = require('../../core/state/product-state');
const { workflowRegistry } = require('../../core/workflows/registry');
const local = require('../../core/local/workflows');
const plan = require('../../core/orchestration/plan');
const toolkit = require('../../core/orchestration/toolkit');

const ORCHESTRATION_WORKFLOW_SUPPORT = Object.freeze({
  'plan.execute': Object.freeze({ support_status: 'HERMES_READY', mode: 'local_orchestration' }),
  'toolkit.execute': Object.freeze({ support_status: 'HERMES_READY', mode: 'local_orchestration' }),
});

function resolveHermesPlan({ product_slug: productSlug, tasks }) {
  const result = plan.resolvePlan(tasks, workflowRegistry);
  return immutableCopy({
    workflow_id: 'plan.execute', runtime: 'hermes', support_status: 'HERMES_READY', mode: 'local_orchestration',
    local_executable: true, external_executable: false, external: result.tasks.some((task) => task.external),
    financial: result.tasks.some((task) => task.financial), approval_required: result.tasks.some((task) => task.approval_required),
    risk_from_children: true, product_slug: productSlug, dispatch: 'not_requested', result,
  });
}

function createHermesToolkit({ projectRoot, product_slug: productSlug, toolkit_id: toolkitId, tasks }) {
  const created = toolkit.createProductToolkit({ projectRoot, product_slug: productSlug, id: toolkitId, tasks, registry: workflowRegistry });
  return immutableCopy({
    workflow_id: 'toolkit.execute', runtime: 'hermes', support_status: 'HERMES_READY', mode: 'local_orchestration',
    local_executable: true, external_executable: false, risk_from_children: true,
    product_path: getProductPath(productSlug, projectRoot), dispatch: 'not_requested', result: created,
  });
}

function transitionHermesToolkit({ projectRoot, product_slug: productSlug, toolkit_id: toolkitId, task_id: taskId, status, extra }) {
  const productPath = getProductPath(productSlug, projectRoot);
  return toolkit.transition(productPath, toolkitId, taskId, status, extra);
}

function reevaluateHermesToolkit({ projectRoot, product_slug: productSlug, toolkit_id: toolkitId, task_id: taskId, update }) {
  const productPath = getProductPath(productSlug, projectRoot);
  return toolkit.reevaluateTask(productPath, toolkitId, taskId, update, workflowRegistry);
}

function pauseHermesToolkit({ projectRoot, product_slug: productSlug, toolkit_id: toolkitId }) {
  return toolkit.pauseToolkit(getProductPath(productSlug, projectRoot), toolkitId);
}

function resumeHermesToolkit({ projectRoot, product_slug: productSlug, toolkit_id: toolkitId }) {
  return toolkit.resumeToolkit(getProductPath(productSlug, projectRoot), toolkitId);
}

function createHermesCarouselSchedule(input) {
  const result = local.createCarouselSchedule(input);
  return immutableCopy({
    workflow_id: 'carousel.schedule', runtime: 'hermes', support_status: 'HERMES_READY', mode: 'dry_run',
    local_executable: true, external_executable: false, external: false, financial: false, approval_required: false,
    publication: false, scheduled: false, result,
  });
}

module.exports = { ORCHESTRATION_WORKFLOW_SUPPORT, resolveHermesPlan, createHermesToolkit, transitionHermesToolkit, reevaluateHermesToolkit, pauseHermesToolkit, resumeHermesToolkit, createHermesCarouselSchedule };
