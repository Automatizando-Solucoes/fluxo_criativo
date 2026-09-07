'use strict';

const { evaluateApproval } = require('../approvals/policy');
const { immutableCopy } = require('../contracts/immutable');

const PLATFORMS = Object.freeze({
  instagram: Object.freeze({ status: 'BLOCKED_EXTERNAL', reason: 'official_publisher_adapter_absent' }),
  facebook: Object.freeze({ status: 'BLOCKED_EXTERNAL', reason: 'official_publisher_adapter_absent' }),
  linkedin: Object.freeze({ status: 'BLOCKED_EXTERNAL', reason: 'official_publisher_adapter_absent' }),
  tiktok: Object.freeze({ status: 'BLOCKED_EXTERNAL', reason: 'official_publisher_adapter_absent' }),
  youtube: Object.freeze({ status: 'BLOCKED_EXTERNAL', reason: 'official_publisher_adapter_absent' }),
});
const FORBIDDEN_REQUEST_FIELDS = Object.freeze(['force_publish', 'skip_approval', 'provider_token', 'raw_request', 'endpoint']);

function createPublicationRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('publication request is required');
  for (const field of ['publication_id', 'workflow_id', 'product', 'platform', 'content_type', 'artifact_path', 'approval_policy']) {
    if (!input[field]) throw new TypeError('publication request fields are required');
  }
  if (input.workflow_id !== 'social.publish') throw new TypeError('publication request workflow_id must be social.publish');
  for (const field of FORBIDDEN_REQUEST_FIELDS) if (Object.hasOwn(input, field)) throw new TypeError(`publication request field is forbidden: ${field}`);
  if (!Object.hasOwn(PLATFORMS, input.platform)) throw new TypeError('unknown publication platform');
  return immutableCopy({
    publication_id: input.publication_id,
    workflow_id: input.workflow_id,
    product: input.product,
    platform: input.platform,
    content_type: input.content_type,
    artifact_path: input.artifact_path,
    scheduled_for: input.scheduled_for || null,
    autopublish: input.autopublish === true,
    approval_policy: input.approval_policy,
  });
}

function blockedPublication(request, error, approval = null) {
  return immutableCopy({
    status: 'blocked', platform: request.platform, publication_id: request.publication_id,
    external_id: null, published_at: null, error, dry_run: true,
    published: false, manual_handoff: { required: true, reason: 'official_publisher_adapter_absent' },
    approval,
  });
}

function evaluatePublication(request, context = {}) {
  const approval = evaluateApproval(request.approval_policy, {
    ...context, workflow_id: 'social.publish', product: request.product, network: request.platform,
    action_type: 'publish', action_id: request.publication_id,
  });
  if (!approval.allowed) return blockedPublication(request, approval.reason);
  return blockedPublication(request, PLATFORMS[request.platform].reason, approval);
}

module.exports = { PLATFORMS, FORBIDDEN_REQUEST_FIELDS, createPublicationRequest, evaluatePublication };
