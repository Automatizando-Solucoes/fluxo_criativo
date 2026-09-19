'use strict';
const assert = require('node:assert/strict');
const { extractSdkImage, createSdkRequest, assertSupportedNode } = require('../../scripts/gemini-nano-banana-runtime');
const jpeg = Buffer.from('ffd8ffe00000', 'hex').toString('base64');

assert.deepEqual(createSdkRequest({
  model: 'gemini-3.1-flash-image',
  prompt: 'safe test prompt',
  response_format: { aspect_ratio: '4:5', resolution: '2K' },
}), {
  model: 'gemini-3.1-flash-image',
  input: 'safe test prompt',
  store: false,
  response_format: { type: 'image', aspect_ratio: '4:5', image_size: '2K', mime_type: 'image/jpeg', delivery: 'inline' },
});
assert.deepEqual(createSdkRequest({
  model: 'gemini-3.1-flash-image',
  prompt: 'safe test prompt',
  response_format: { aspect_ratio: '1:1', resolution: '0.5K' },
}).response_format, { type: 'image', aspect_ratio: '1:1', image_size: '512', mime_type: 'image/jpeg', delivery: 'inline' });
assert.equal(assertSupportedNode('20.0.0'), true);
assert.throws(() => assertSupportedNode('18.20.4'), /Node.js 20 or newer/);

assert.deepEqual(extractSdkImage({
  id: 'interaction-safe-id',
  output_image: { data: jpeg, mime_type: 'image/jpeg' },
  usage: { total_input_tokens: 100, total_output_tokens: 1120, total_tokens: 1220 },
}), {
  id: 'interaction-safe-id',
  output_image: { data: jpeg, mime_type: 'image/jpeg' },
  usage: { input_tokens: 100, output_tokens: 1120, total_tokens: 1220 },
});
assert.equal(extractSdkImage({ id: 'safe' }), null);
console.log('Gemini SDK runtime extraction: ok');
