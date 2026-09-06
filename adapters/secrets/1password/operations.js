'use strict';

const { immutableCopy } = require('../../../core/contracts/immutable');

const ONEPASSWORD_OPERATION_REGISTRY = immutableCopy([
  { id: 'research.fetch', mode: 'dry_run', execution: 'blocked' },
  { id: 'image.generate', mode: 'dry_run', execution: 'blocked' },
  { id: 'video.generate', mode: 'dry_run', execution: 'blocked' },
  { id: 'ads.insights', mode: 'dry_run', execution: 'blocked' },
  { id: 'notification.send', mode: 'dry_run', execution: 'blocked' },
  { id: 'publisher.publish', mode: 'dry_run', execution: 'blocked' },
]);

function getAllowedOperation(operationId) {
  const operation = ONEPASSWORD_OPERATION_REGISTRY.find((entry) => entry.id === operationId);
  if (!operation) throw new Error(`1Password operation is not allowlisted: ${operationId}`);
  return operation;
}

function prepareRuntimeInjection(operationId) {
  const operation = getAllowedOperation(operationId);
  return immutableCopy({
    operation_id: operation.id,
    mode: operation.mode,
    execution: operation.execution,
    injected: false,
  });
}

module.exports = { ONEPASSWORD_OPERATION_REGISTRY, getAllowedOperation, prepareRuntimeInjection };
