'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');
const { getHighTicketStatus } = require('../../core/external/high-ticket-status');

function getCodexHighTicketStatus(input) {
  return immutableCopy({ runtime: 'codex', support_status: 'CODEX_BLOCKED_EXTERNAL', execution: 'not_implemented', local_executable: true, external_executable: false, result: getHighTicketStatus(input) });
}

module.exports = { getCodexHighTicketStatus };
