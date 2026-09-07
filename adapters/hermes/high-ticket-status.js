'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');
const { getHighTicketStatus } = require('../../core/external/high-ticket-status');

function getHermesHighTicketStatus(input) {
  const result = getHighTicketStatus(input);
  return immutableCopy({
    runtime: 'hermes', support_status: 'HERMES_BLOCKED_EXTERNAL',
    execution: 'not_implemented', local_executable: true, external_executable: false, result,
  });
}

module.exports = { getHermesHighTicketStatus };
