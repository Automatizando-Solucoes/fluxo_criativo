'use strict';

const { immutableCopy } = require('../../../core/contracts/immutable');
const { workflowRegistry } = require('../../../core/workflows/registry');
const { createScheduledJob } = require('../../../core/scheduling/job');
const { PROJECT_ROOT } = require('../../../core/state/product-state');
const { resolveHermesWorkflow } = require('../resolver');

function toHermesCronJob(jobInput) {
  const job = createScheduledJob(jobInput);
  const workflow = workflowRegistry.get(job.workflow_id);
  const resolution = resolveHermesWorkflow(job.workflow_id);
  let scheduled = job.enabled;
  let reason = 'dry_run';
  if (job.approval_policy.mode === 'disabled') {
    scheduled = false;
    reason = 'approval_disabled';
  } else if (job.approval_policy.mode === 'manual') {
    scheduled = false;
    reason = 'manual_approval_required';
  } else if (!job.enabled) {
    reason = 'job_disabled';
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
    scheduled,
    mode: 'dry_run',
    reason,
  });
}

module.exports = { toHermesCronJob };
