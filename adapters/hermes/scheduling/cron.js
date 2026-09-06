'use strict';

const { immutableCopy } = require('../../../core/contracts/immutable');
const { evaluateApproval } = require('../../../core/approvals/policy');
const { workflowRegistry } = require('../../../core/workflows/registry');
const { createScheduledJob } = require('../../../core/scheduling/job');
const { PROJECT_ROOT } = require('../../../core/state/product-state');
const { resolveHermesWorkflow } = require('../resolver');

function buildApprovalContext(job, approvalContext = {}) {
  if (!approvalContext || typeof approvalContext !== 'object' || Array.isArray(approvalContext)) {
    throw new TypeError('approvalContext must be an object');
  }
  const context = { ...approvalContext };
  if (context.workflow_id === undefined) context.workflow_id = job.workflow_id;
  if (context.product === undefined && typeof job.input.product_slug === 'string') {
    context.product = job.input.product_slug;
  }
  return context;
}

function toHermesCronJob(jobInput, approvalContext) {
  const job = createScheduledJob(jobInput);
  const workflow = workflowRegistry.get(job.workflow_id);
  const resolution = resolveHermesWorkflow(job.workflow_id);
  const context = buildApprovalContext(job, approvalContext);
  const approvalResult = evaluateApproval(job.approval_policy, context);
  let eligibleForSchedule = false;
  let reason = approvalResult.reason;
  if (job.approval_policy.mode === 'disabled') {
    reason = 'approval_disabled';
  } else if (job.approval_policy.mode === 'manual') {
    reason = 'manual_approval_required';
  } else if (!job.enabled) {
    reason = 'job_disabled';
  } else if (!approvalResult.allowed) {
    reason = `approval_${approvalResult.reason}`;
  } else if (workflow.side_effects.external) {
    reason = 'external_capability_blocked';
  } else {
    eligibleForSchedule = true;
    reason = 'eligible_dry_run';
  }
  return immutableCopy({
    kind: 'hermes.cron',
    job_id: job.job_id,
    workflow_id: job.workflow_id,
    input: job.input,
    schedule: job.schedule,
    timezone: job.timezone,
    idempotency_key: job.idempotency_key,
    approval_policy: job.approval_policy,
    destination: job.destination,
    workdir: PROJECT_ROOT,
    skills: [resolution.target.path],
    requires_child_risk_resolution: resolution.requires_child_risk_resolution,
    external_capability_granted: false,
    external_interaction_declared: workflow.side_effects.external,
    approval_context: context,
    approval_evaluation: approvalResult,
    eligible_for_schedule: eligibleForSchedule,
    scheduled: false,
    mode: 'dry_run',
    reason,
  });
}

module.exports = { buildApprovalContext, toHermesCronJob };
