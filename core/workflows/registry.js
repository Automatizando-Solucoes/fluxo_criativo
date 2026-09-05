'use strict';

const { assertWorkflowContract } = require('../contracts/workflow');
const { workflowDefinitions } = require('./definitions');

class UnknownWorkflowError extends Error {
  constructor(workflowId) {
    super(`unknown workflow: ${workflowId}`);
    this.name = 'UnknownWorkflowError';
  }
}

function createWorkflowRegistry(definitions = workflowDefinitions) {
  const entries = new Map();
  for (const definition of definitions) {
    const workflow = assertWorkflowContract(definition);
    if (entries.has(workflow.id)) throw new Error(`duplicate workflow id: ${workflow.id}`);
    entries.set(workflow.id, workflow);
  }
  return Object.freeze({
    list() {
      return Object.freeze([...entries.values()]);
    },
    get(workflowId) {
      const workflow = entries.get(workflowId);
      if (!workflow) throw new UnknownWorkflowError(workflowId);
      return workflow;
    },
    has(workflowId) {
      return entries.has(workflowId);
    },
  });
}

const workflowRegistry = createWorkflowRegistry();

module.exports = { UnknownWorkflowError, createWorkflowRegistry, workflowRegistry };
