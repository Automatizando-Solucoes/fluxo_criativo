'use strict';

const { INTEGRATION_CAPABILITIES } = require('../integrations/contracts');
const { immutableCopy } = require('./immutable');

const CAPABILITY_PATTERN = /^[a-z][a-z0-9_-]*\.[a-z][a-z0-9_-]*$/;
const WORKFLOW_ID_PATTERN = /^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$/;

function assertWorkflowContract(workflow) {
  if (!workflow || typeof workflow !== 'object' || Array.isArray(workflow)) {
    throw new TypeError('workflow must be an object');
  }
  if (typeof workflow.id !== 'string' || !WORKFLOW_ID_PATTERN.test(workflow.id)) {
    throw new TypeError('workflow.id must be a dotted logical identifier');
  }
  if (!Number.isInteger(workflow.version) || workflow.version < 1) {
    throw new TypeError('workflow.version must be a positive integer');
  }
  if (typeof workflow.category !== 'string' || workflow.category.length === 0) {
    throw new TypeError('workflow.category must be a non-empty string');
  }
  if (!workflow.inputs || typeof workflow.inputs !== 'object' || Array.isArray(workflow.inputs)) {
    throw new TypeError('workflow.inputs must be an object');
  }
  if (!Array.isArray(workflow.outputs) || !Array.isArray(workflow.requires) || !Array.isArray(workflow.capabilities)) {
    throw new TypeError('workflow outputs, requires and capabilities must be arrays');
  }
  for (const capability of workflow.capabilities) {
    if (typeof capability !== 'string' || !CAPABILITY_PATTERN.test(capability)) {
      throw new TypeError(`invalid workflow capability: ${capability}`);
    }
  }
  if (!workflow.side_effects || typeof workflow.side_effects.external !== 'boolean' || typeof workflow.side_effects.financial !== 'boolean') {
    throw new TypeError('workflow.side_effects must declare external and financial booleans');
  }
  if (workflow.capabilities.some((capability) => INTEGRATION_CAPABILITIES.includes(capability)) && !workflow.side_effects.external) {
    throw new TypeError('workflows with integration capabilities must declare external side effects');
  }
  if (workflow.kind !== 'atomic' && workflow.kind !== 'composite') {
    throw new TypeError('workflow.kind must be atomic or composite');
  }
  if (typeof workflow.risk_from_children !== 'boolean') {
    throw new TypeError('workflow.risk_from_children must be boolean');
  }
  if (workflow.kind === 'composite' && !workflow.risk_from_children) {
    throw new TypeError('composite workflows must inherit risk from children');
  }
  if (!workflow.approval || typeof workflow.approval.required !== 'boolean') {
    throw new TypeError('workflow.approval.required must be boolean');
  }
  if (!workflow.source || typeof workflow.source.kind !== 'string' || typeof workflow.source.path !== 'string') {
    throw new TypeError('workflow.source must describe the current compatibility source');
  }
  return immutableCopy(workflow);
}

function requiresChildRiskResolution(workflow) {
  return workflow.kind === 'composite' && workflow.risk_from_children === true;
}

module.exports = { assertWorkflowContract, requiresChildRiskResolution, WORKFLOW_ID_PATTERN };
