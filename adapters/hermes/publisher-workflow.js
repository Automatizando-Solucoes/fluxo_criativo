'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');
const publisher = require('../../core/external/organic-publisher');

const HERMES_PUBLISHER_SUPPORT = Object.freeze({
  'social.publish': Object.freeze({ support_status: 'HERMES_BLOCKED_EXTERNAL', mode: 'blocked_external' }),
});

function createHermesPublicationRequest(input) {
  const request = publisher.createPublicationRequest(input);
  return immutableCopy({
    workflow_id: 'social.publish', runtime: 'hermes', support_status: 'HERMES_BLOCKED_EXTERNAL',
    local_executable: true, external_executable: false, external: true, financial: false, approval_required: true,
    mode: 'blocked_external', request,
  });
}

function evaluateHermesPublication(input, context = {}) {
  const request = input?.request || publisher.createPublicationRequest(input);
  const result = publisher.evaluatePublication(request, context);
  return immutableCopy({
    workflow_id: 'social.publish', runtime: 'hermes', support_status: 'HERMES_BLOCKED_EXTERNAL',
    local_executable: true, external_executable: false, external: true, financial: false, approval_required: true,
    mode: 'blocked_external', result,
  });
}

module.exports = { HERMES_PUBLISHER_SUPPORT, createHermesPublicationRequest, evaluateHermesPublication };
