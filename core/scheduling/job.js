'use strict';

const { createApprovalPolicy } = require('../approvals/policy');

function assertTimezone(timezone) {
  if (typeof timezone !== 'string' || timezone.length === 0) {
    throw new TypeError('timezone is required');
  }
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone });
  } catch {
    throw new TypeError(`invalid IANA timezone: ${timezone}`);
  }
}

function assertSchedule(schedule) {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    throw new TypeError('schedule must be an object');
  }
  if (schedule.kind !== 'cron' && schedule.kind !== 'once') {
    throw new TypeError('schedule.kind must be cron or once');
  }
  if (schedule.kind === 'cron' && (typeof schedule.expression !== 'string' || schedule.expression.trim().length === 0)) {
    throw new TypeError('cron schedules require an expression');
  }
  if (schedule.kind === 'once' && (typeof schedule.at !== 'string' || Number.isNaN(Date.parse(schedule.at)))) {
    throw new TypeError('one-time schedules require an ISO-compatible at date');
  }
}

function createScheduledJob(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('scheduled job must be an object');
  }
  for (const field of ['job_id', 'workflow_id', 'idempotency_key']) {
    if (typeof input[field] !== 'string' || input[field].length === 0) {
      throw new TypeError(`${field} is required`);
    }
  }
  if (!input.input || typeof input.input !== 'object' || Array.isArray(input.input)) {
    throw new TypeError('input must be an object');
  }
  assertSchedule(input.schedule);
  assertTimezone(input.timezone);
  if (!input.approval_policy || typeof input.approval_policy !== 'object') {
    throw new TypeError('approval_policy is required');
  }
  const approvalPolicy = createApprovalPolicy(input.approval_policy);
  if (approvalPolicy.workflow_id !== input.workflow_id) {
    throw new TypeError('approval_policy.workflow_id must match job.workflow_id');
  }
  if (!input.destination || typeof input.destination !== 'object' || Array.isArray(input.destination)) {
    throw new TypeError('destination is required');
  }
  if (typeof input.enabled !== 'boolean') throw new TypeError('enabled must be boolean');
  return Object.freeze({
    job_id: input.job_id,
    workflow_id: input.workflow_id,
    input: Object.freeze({ ...input.input }),
    schedule: Object.freeze({ ...input.schedule }),
    timezone: input.timezone,
    idempotency_key: input.idempotency_key,
    approval_policy: approvalPolicy,
    destination: Object.freeze({ ...input.destination }),
    enabled: input.enabled,
  });
}

module.exports = { createScheduledJob, assertTimezone, assertSchedule };
