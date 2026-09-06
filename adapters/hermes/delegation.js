'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');
const { workflowRegistry } = require('../../core/workflows/registry');
const { assertProductSlug } = require('../../core/state/product-state');
const { getAgentMapping } = require('./agents');

const DELEGATE_SAFE_CAPABILITIES = Object.freeze(['filesystem.read', 'filesystem.write']);

function assertString(value, field) {
  if (typeof value !== 'string' || value.length === 0) throw new TypeError(`${field} is required`);
}

function createDelegateRequest(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('delegate request must be an object');
  }
  for (const field of ['delegate_id', 'agent', 'workflow_id', 'product_slug', 'task']) {
    assertString(input[field], field);
  }
  const mapping = getAgentMapping(input.agent);
  if (mapping.role !== 'DELEGATE') throw new TypeError('agent is not eligible for Hermes delegation');
  const workflow = workflowRegistry.get(input.workflow_id);
  assertProductSlug(input.product_slug);
  if (!Array.isArray(input.allowed_capabilities)) throw new TypeError('allowed_capabilities must be an array');
  for (const capability of input.allowed_capabilities) {
    if (!DELEGATE_SAFE_CAPABILITIES.includes(capability)) {
      throw new TypeError(`delegate capability is forbidden: ${capability}`);
    }
    if (!workflow.capabilities.includes(capability)) {
      throw new TypeError(`delegate capability escalates workflow: ${capability}`);
    }
  }
  if (!Array.isArray(input.input_paths) || input.input_paths.some((value) => typeof value !== 'string' || value.startsWith('/') || value.includes('..'))) {
    throw new TypeError('input_paths must be relative non-traversing paths');
  }
  if (!input.output_contract || typeof input.output_contract !== 'object' || Array.isArray(input.output_contract)) {
    throw new TypeError('output_contract is required');
  }
  return immutableCopy({
    delegate_id: input.delegate_id,
    agent: input.agent,
    workflow_id: workflow.id,
    product_slug: input.product_slug,
    task: input.task,
    allowed_capabilities: [...input.allowed_capabilities],
    input_paths: [...input.input_paths],
    output_contract: { ...input.output_contract },
    max_delegation_depth: 0,
    mode: 'dry_run',
  });
}

function resolveDelegateRequest(request) {
  return immutableCopy({
    delegate_id: request.delegate_id,
    agent: request.agent,
    workflow_id: request.workflow_id,
    allowed_capabilities: request.allowed_capabilities,
    status: 'dry_run',
    dispatched: false,
  });
}

module.exports = { DELEGATE_SAFE_CAPABILITIES, createDelegateRequest, resolveDelegateRequest };
