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
  if (input.limits !== undefined && (typeof input.limits !== 'object' || input.limits === null || Array.isArray(input.limits))) {
    throw new TypeError('limits must be an object');
  }
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
    limits: Object.freeze({ ...(input.limits || {}) }),
    authorized_by: input.authorized_by || null,
    created_at: input.created_at || null,
    revoked_at: input.revoked_at || null,
  });
}

function evaluateApproval(policy, now = new Date()) {
  const current = typeof now === 'string' ? new Date(now) : now;
  if (!(current instanceof Date) || Number.isNaN(current.getTime())) {
    throw new TypeError('now must be a valid Date or date string');
  }
  if (policy.mode === 'disabled') return { allowed: false, reason: 'disabled' };
  if (policy.revoked_at) return { allowed: false, reason: 'revoked' };
  if (policy.expires_at && new Date(policy.expires_at) <= current) {
    return { allowed: false, reason: 'expired' };
  }
  if (!policy.authorized_by) return { allowed: false, reason: 'not_authorized' };
  return { allowed: true, reason: policy.mode };
}

module.exports = { APPROVAL_MODES, createApprovalPolicy, evaluateApproval };
