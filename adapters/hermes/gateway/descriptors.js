'use strict';

const { immutableCopy } = require('../../../core/contracts/immutable');

const GATEWAY_EVENTS = Object.freeze([
  'approval.request',
  'workflow.completed',
  'workflow.failed',
  'report.ready',
]);
const FUTURE_CHANNELS = Object.freeze(['telegram', 'whatsapp', 'slack', 'discord']);

function assertNoSensitiveFields(value, path = 'payload') {
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    if (/(secret|token|password|api[_-]?key)/i.test(key)) {
      throw new TypeError(`${path}.${key} is not allowed in a gateway descriptor`);
    }
    assertNoSensitiveFields(nested, `${path}.${key}`);
  }
}

function createGatewayDescriptor(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('gateway descriptor must be an object');
  }
  if (!GATEWAY_EVENTS.includes(input.event)) throw new TypeError(`unsupported gateway event: ${input.event}`);
  if (typeof input.channel !== 'string' || !FUTURE_CHANNELS.includes(input.channel)) {
    throw new TypeError('gateway channel must be a declared future channel');
  }
  if (!input.payload || typeof input.payload !== 'object' || Array.isArray(input.payload)) {
    throw new TypeError('gateway payload must be an object');
  }
  assertNoSensitiveFields(input.payload);
  return immutableCopy({
    event: input.event,
    channel: input.channel,
    payload: input.payload,
    delivery: 'dry_run',
    sent: false,
  });
}

function formatGatewayNotification(descriptor) {
  return immutableCopy({
    event: descriptor.event,
    channel: descriptor.channel,
    delivery: 'dry_run',
    sent: false,
    payload: descriptor.payload,
  });
}

module.exports = { GATEWAY_EVENTS, FUTURE_CHANNELS, createGatewayDescriptor, formatGatewayNotification };
