'use strict';

const APPROVAL_MODES = Object.freeze(['manual', 'standing', 'disabled']);

function assertOptionalString(value, field) {
  if (value !== null && value !== undefined && typeof value !== 'string') {
    throw new TypeError(`${field} must be a string or null`);
  }
}

function parseOptionalDate(value, field) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new TypeError(`${field} must be an ISO-compatible date string or null`);
  }
  return value;
}

function assertLimits(limits) {
  if (limits === undefined) return {};
  if (typeof limits !== 'object' || limits === null || Array.isArray(limits)) {
    throw new TypeError('limits must be an object');
  }
  for (const [name, value] of Object.entries(limits)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new TypeError(`limits.${name} must be a non-negative number`);
    }
  }
  return limits;
}

function assertManualGrant(grant) {
  if (grant === undefined || grant === null) return null;
  if (typeof grant !== 'object' || Array.isArray(grant)) {
    throw new TypeError('manual_grant must be an object or null');
  }
  for (const field of ['action_id', 'approved_by', 'approved_at']) {
    if (typeof grant[field] !== 'string' || grant[field].length === 0) {
      throw new TypeError(`manual_grant.${field} is required`);
    }
  }
  parseOptionalDate(grant.approved_at, 'manual_grant.approved_at');
  return grant;
}

function createApprovalPolicy(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('approval policy must be an object');
  }
  const mode = input.mode || 'manual';
  if (!APPROVAL_MODES.includes(mode)) {
    throw new TypeError(`unsupported approval mode: ${mode}`);
  }
  if (typeof input.workflow_id !== 'string' || input.workflow_id.length === 0) {
    throw new TypeError('workflow_id is required');
  }
  const scope = input.scope || {};
  if (typeof scope !== 'object' || Array.isArray(scope)) {
    throw new TypeError('scope must be an object');
  }
  for (const field of ['product', 'network', 'action_type']) {
    assertOptionalString(scope[field], `scope.${field}`);
    assertOptionalString(input[field], field);
  }
  const limits = assertLimits(input.limits);
  const manualGrant = assertManualGrant(input.manual_grant);
  assertOptionalString(input.authorized_by, 'authorized_by');
  parseOptionalDate(input.created_at, 'created_at');
  parseOptionalDate(input.expires_at, 'expires_at');
  parseOptionalDate(input.revoked_at, 'revoked_at');

  const resolvedScope = {
    product: input.product || scope.product || null,
    network: input.network || scope.network || null,
    action_type: input.action_type || scope.action_type || null,
  };
  return Object.freeze({
    mode,
    workflow_id: input.workflow_id,
    product: resolvedScope.product,
    network: resolvedScope.network,
    action_type: resolvedScope.action_type,
    scope: Object.freeze(resolvedScope),
    expires_at: input.expires_at || null,
    limits: Object.freeze({ ...limits }),
    authorized_by: input.authorized_by || null,
    created_at: input.created_at || null,
    revoked_at: input.revoked_at || null,
    manual_grant: manualGrant ? Object.freeze({ ...manualGrant }) : null,
  });
}

function assertActionContext(context) {
  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    throw new TypeError('action context must be an object');
  }
  if (typeof context.workflow_id !== 'string' || context.workflow_id.length === 0) {
    throw new TypeError('context.workflow_id is required');
  }
  for (const field of ['product', 'network', 'action_type', 'action_id']) {
    assertOptionalString(context[field], `context.${field}`);
  }
  if (context.usage !== undefined && (typeof context.usage !== 'object' || context.usage === null || Array.isArray(context.usage))) {
    throw new TypeError('context.usage must be an object');
  }
  return context;
}

function evaluateLimits(limits, usage) {
  for (const [name, limit] of Object.entries(limits)) {
    if (!usage || !Object.hasOwn(usage, name) || !Number.isFinite(usage[name]) || usage[name] < 0) {
      return { allowed: false, reason: 'limits_not_evaluated' };
    }
    if (usage[name] > limit) return { allowed: false, reason: `limit_exceeded:${name}` };
  }
  return { allowed: true };
}

function evaluateApproval(policyInput, context) {
  const policy = createApprovalPolicy(policyInput);
  const action = assertActionContext(context);
  const current = action.now === undefined ? new Date() : new Date(action.now);
  if (!(current instanceof Date) || Number.isNaN(current.getTime())) {
    throw new TypeError('context.now must be a valid Date or date string');
  }
  if (policy.mode === 'disabled') return { allowed: false, reason: 'disabled' };
  if (policy.revoked_at) return { allowed: false, reason: 'revoked' };
  if (policy.expires_at && new Date(policy.expires_at) <= current) {
    return { allowed: false, reason: 'expired' };
  }
  if (policy.workflow_id !== action.workflow_id) return { allowed: false, reason: 'workflow_mismatch' };
  for (const field of ['product', 'network', 'action_type']) {
    if (policy[field] !== null && policy[field] !== action[field]) {
      return { allowed: false, reason: `${field}_mismatch` };
    }
  }
  const limitResult = evaluateLimits(policy.limits, action.usage);
  if (!limitResult.allowed) return limitResult;
  if (policy.mode === 'standing') {
    return policy.authorized_by
      ? { allowed: true, reason: 'standing' }
      : { allowed: false, reason: 'not_authorized' };
  }
  if (!policy.manual_grant) return { allowed: false, reason: 'manual_grant_required' };
  if (!action.action_id || policy.manual_grant.action_id !== action.action_id) {
    return { allowed: false, reason: 'manual_action_mismatch' };
  }
  return { allowed: true, reason: 'manual' };
}

module.exports = { APPROVAL_MODES, createApprovalPolicy, evaluateApproval, assertActionContext };
