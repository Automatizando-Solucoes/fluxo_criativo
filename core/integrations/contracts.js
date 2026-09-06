'use strict';

const INTEGRATION_CAPABILITIES = Object.freeze([
  'image.generate',
  'video.generate',
  'ads.insights',
  'research.fetch',
  'notification.send',
  'publisher.publish',
]);

function defineIntegrationContract(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('integration contract must be an object');
  }
  if (typeof input.capability !== 'string' || !INTEGRATION_CAPABILITIES.includes(input.capability)) {
    throw new TypeError('integration contract must use a supported neutral capability');
  }
  if (!Array.isArray(input.inputs) || !Array.isArray(input.outputs)) {
    throw new TypeError('integration inputs and outputs must be arrays');
  }
  if (typeof input.side_effect !== 'boolean') {
    throw new TypeError('integration side_effect must be boolean');
  }
  return Object.freeze({
    capability: input.capability,
    inputs: Object.freeze([...input.inputs]),
    outputs: Object.freeze([...input.outputs]),
    side_effect: input.side_effect,
  });
}

module.exports = { INTEGRATION_CAPABILITIES, defineIntegrationContract };
