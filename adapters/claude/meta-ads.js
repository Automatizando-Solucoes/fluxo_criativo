'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');
const { evaluateApproval } = require('../../core/approvals/policy');

const META_ACCESS_TOKEN = 'META_ACCESS_TOKEN';
const META_SECRET_ALIASES = Object.freeze({
  META_ACCESS_TOKEN,
  FB_ACCESS_TOKEN_PERMANENTE: META_ACCESS_TOKEN,
  FB_ACCESS_TOKEN_TEMPORARIO: META_ACCESS_TOKEN,
  ACCESS_TOKEN: META_ACCESS_TOKEN,
});

const META_OPERATION_DESCRIPTORS = Object.freeze({
  'meta.auth.validate': { class: 'READ', financial: false, approval: false },
  'meta.accounts.list': { class: 'READ', financial: false, approval: false },
  'ads.account.read': { class: 'READ', financial: false, approval: false },
  'ads.campaigns.list': { class: 'READ', financial: false, approval: false },
  'ads.insights': { class: 'READ', financial: false, approval: false },
  'ads.pixels.list': { class: 'READ', financial: false, approval: false },
  'ads.conversions.list': { class: 'READ', financial: false, approval: false },
  'ads.audiences.list': { class: 'READ', financial: false, approval: false },
  'ads.interests.search': { class: 'READ', financial: false, approval: false },
  'ads.creatives.validate': { class: 'READ', financial: false, approval: false },
  'ads.campaign.create': { class: 'WRITE', financial: false, approval: true },
  'ads.campaign.update_status': { class: 'WRITE', financial: false, approval: true },
  'ads.optimize': { class: 'WRITE', financial: false, approval: true },
  'ads.scale': { class: 'FINANCIAL_WRITE', financial: true, approval: true },
});

const LEGACY_OPERATION_IDS = Object.freeze({
  insights: 'ads.insights',
  report: 'ads.insights',
  create_campaign: 'ads.campaign.create',
  optimize: 'ads.optimize',
  activate_campaign: 'ads.campaign.update_status',
  increase_budget: 'ads.scale',
  scale: 'ads.scale',
});

const META_OPERATIONS = Object.freeze(Object.fromEntries(
  Object.entries(LEGACY_OPERATION_IDS).map(([legacyId, id]) => [legacyId, META_OPERATION_DESCRIPTORS[id].class]),
));
const META_AUTH_OPERATIONS = Object.freeze({
  'meta.auth.validate': 'meta.auth.validate',
  'meta.accounts.list': 'meta.accounts.list',
});
const META_AUTH_MODES = Object.freeze(['APP', 'MCP_CONECTOR']);

function resolveMetaOperation(operation) {
  const id = META_OPERATION_DESCRIPTORS[operation] ? operation : LEGACY_OPERATION_IDS[operation];
  return id ? { id, ...META_OPERATION_DESCRIPTORS[id] } : null;
}

function assertAuthMode(authMode) {
  if (!META_AUTH_MODES.includes(authMode)) throw new TypeError('unsupported Meta auth mode');
  return authMode;
}
function createMetaOperationDescriptor(operation, { auth_mode: authMode = 'APP' } = {}) {
  assertAuthMode(authMode);
  const definition = resolveMetaOperation(operation);
  if (!definition) return immutableCopy({ status: 'blocked', reason: 'operation_not_allowlisted', operation });
  return immutableCopy({
    id: definition.id,
    provider: 'meta',
    class: definition.class,
    required_secret: authMode === 'APP' ? META_ACCESS_TOKEN : null,
    auth_mode: authMode,
    transport: authMode === 'MCP_CONECTOR' ? 'mcp' : 'app',
    oauth_managed_externally: authMode === 'MCP_CONECTOR',
    external: true,
    financial: definition.financial,
    approval: definition.approval ? 'manual' : null,
    mode: 'dry_run',
  });
}

function createMetaAuthDescriptor(operation, options) {
  const descriptor = createMetaOperationDescriptor(operation, options);
  if (descriptor.status === 'blocked' || !Object.hasOwn(META_AUTH_OPERATIONS, descriptor.id)) {
    throw new Error('Meta auth operation is not allowlisted');
  }
  return descriptor;
}

function prepareMetaOperation({ operation, policy, context, secretProvider, auth_mode: authMode = 'APP' }) {
  const descriptor = createMetaOperationDescriptor(operation, { auth_mode: authMode });
  if (descriptor.status === 'blocked') return descriptor;
  if (authMode === 'APP' && (!secretProvider || !secretProvider.has_secret(META_ACCESS_TOKEN))) {
    return immutableCopy({ status: 'blocked', reason: 'secret_unavailable', operation: descriptor.id, category: descriptor.class });
  }
  if (!descriptor.approval) {
    return immutableCopy({ status: 'dry_run', operation: descriptor.id, category: descriptor.class, secret_name: descriptor.required_secret, auth_mode: authMode, transport: descriptor.transport, oauth_managed_externally: descriptor.oauth_managed_externally });
  }
  const approval = evaluateApproval(policy, context);
  if (!approval.allowed) {
    return immutableCopy({ status: 'blocked', reason: approval.reason, operation: descriptor.id, category: descriptor.class });
  }
  if (policy.mode !== 'manual') {
    return immutableCopy({ status: 'blocked', reason: 'manual_approval_required', operation: descriptor.id, category: descriptor.class });
  }
  return immutableCopy({ status: 'dry_run', operation: descriptor.id, category: descriptor.class, secret_name: descriptor.required_secret, approval, auth_mode: authMode, transport: descriptor.transport, oauth_managed_externally: descriptor.oauth_managed_externally });
}

function createPausedCampaignDraft({ name, action_id }) {
  if (!name || !action_id) throw new TypeError('campaign name and action_id are required');
  return immutableCopy({ action_id, name, status: 'PAUSED', execution: 'dry_run' });
}

module.exports = {
  META_ACCESS_TOKEN,
  META_SECRET_ALIASES,
  META_OPERATIONS,
  META_AUTH_OPERATIONS,
  META_AUTH_MODES,
  META_OPERATION_DESCRIPTORS,
  createMetaOperationDescriptor,
  createMetaAuthDescriptor,
  prepareMetaOperation,
  createPausedCampaignDraft,
};
