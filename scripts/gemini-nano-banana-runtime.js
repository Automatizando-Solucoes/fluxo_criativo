'use strict';

const fs = require('node:fs');
const { GoogleGenAI } = require('@google/genai');

function assertSupportedNode(version = process.versions.node) {
  const major = Number.parseInt(String(version).split('.')[0], 10);
  if (!Number.isInteger(major) || major < 20) throw new Error('Node.js 20 or newer is required by @google/genai');
  return true;
}

function extractSdkUsage(interaction) {
  const source = interaction && (interaction.usage || interaction.usageMetadata || interaction.usage_metadata);
  if (!source || typeof source !== 'object') return null;
  const number = (...values) => values.find((value) => Number.isFinite(value) && value >= 0);
  const input_tokens = number(source.total_input_tokens, source.promptTokenCount, source.prompt_token_count, source.inputTokens, source.input_tokens);
  const output_tokens = number(source.total_output_tokens, source.candidatesTokenCount, source.candidates_token_count, source.outputTokens, source.output_tokens);
  const total_tokens = number(source.total_tokens, source.totalTokenCount, source.total_token_count, source.totalTokens);
  if (input_tokens === undefined && output_tokens === undefined && total_tokens === undefined) return null;
  return { ...(input_tokens === undefined ? {} : { input_tokens }), ...(output_tokens === undefined ? {} : { output_tokens }), ...(total_tokens === undefined ? {} : { total_tokens }) };
}

function extractSdkImage(interaction) {
  const image = interaction && (interaction.output_image || interaction.outputImage);
  if (!image || typeof image.data !== 'string') return null;
  const mime_type = image.mime_type || image.mimeType || null;
  const usage = extractSdkUsage(interaction);
  return { id: typeof interaction.id === 'string' ? interaction.id : null, output_image: { data: image.data, mime_type }, ...(usage ? { usage } : {}) };
}

function createSdkRequest(request) {
  const format = request && request.response_format;
  if (!request || typeof request.model !== 'string' || typeof request.prompt !== 'string' || !format) throw new Error('invalid image request');
  const image_size = format.resolution === '0.5K' ? '512' : format.resolution;
  if (!['512', '1K', '2K', '4K'].includes(image_size)) throw new Error('unsupported image resolution');
  return {
    model: request.model,
    input: request.prompt,
    store: false,
    response_format: { type: 'image', aspect_ratio: format.aspect_ratio, image_size, mime_type: 'image/jpeg', delivery: 'inline' },
  };
}

async function main() {
  const [requestPath, responsePath] = process.argv.slice(2);
  if (!requestPath || !responsePath) throw new Error('request and response paths are required');
  assertSupportedNode();
  const request = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
  const key = process.env.GEMINI_API_KEY;
  let result;
  if (!key) {
    result = { ok: false, error: 'gemini_secret_unavailable' };
  } else {
    try {
      const client = new GoogleGenAI({ apiKey: key });
      const interaction = await client.interactions.create(createSdkRequest(request));
      const extracted = extractSdkImage(interaction);
      result = extracted ? { ok: true, ...extracted } : { ok: false, error: 'gemini_image_missing' };
    } catch (error) {
      const status = Number.isInteger(error && error.status) ? error.status : null;
      result = { ok: false, error: 'gemini_sdk_error' };
      if (status) result.http_status = status;
    }
  }
  fs.writeFileSync(responsePath, JSON.stringify(result), { mode: 0o600 });
  process.exitCode = result.ok ? 0 : 2;
}

if (require.main === module) {
  main().catch((error) => {
    const responsePath = process.argv[3];
    if (responsePath) fs.writeFileSync(responsePath, JSON.stringify({ ok: false, error: 'gemini_sdk_runtime_error' }), { mode: 0o600 });
    process.exitCode = 2;
  });
}
module.exports = { assertSupportedNode, createSdkRequest, extractSdkImage };
