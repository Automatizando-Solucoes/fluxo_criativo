'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { evaluateApproval } = require('../../core/approvals/policy');

const MODEL = 'gemini-3.1-flash-image';
const ASPECT_RATIOS = new Set(['1:1', '4:5', '5:4', '16:9', '9:16', '3:2', '2:3']);
const RESOLUTIONS = new Set(['0.5K', '1K', '2K', '4K']);
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const GEMINI_IMAGE_OUTPUT_USD = Object.freeze({ '0.5K': 0.045, '1K': 0.067, '2K': 0.101, '4K': 0.151 });
const GEMINI_INPUT_TEXT_USD_PER_MILLION = 0.5;
const GEMINI_PRICE_SOURCE = 'https://ai.google.dev/gemini-api/docs/pricing';

function estimateGeminiImageCost({ resolution, usage = {} }) {
  if (!Object.hasOwn(GEMINI_IMAGE_OUTPUT_USD, resolution)) throw new Error('resolution is not priced');
  const input_tokens = Number.isFinite(usage.input_tokens) && usage.input_tokens >= 0 ? usage.input_tokens : null;
  const input_text_usd = input_tokens === null ? null : Number((input_tokens * GEMINI_INPUT_TEXT_USD_PER_MILLION / 1_000_000).toFixed(8));
  const output_image_usd = GEMINI_IMAGE_OUTPUT_USD[resolution];
  return Object.freeze({
    status: 'estimated',
    provider_usage: input_tokens === null ? 'unavailable' : 'available',
    currency: 'USD',
    billing_mode: 'standard',
    input_tokens,
    output_image_usd,
    input_text_usd,
    total_usd: Number((output_image_usd + (input_text_usd || 0)).toFixed(8)),
    price_source: GEMINI_PRICE_SOURCE,
  });
}

function safeSlug(value) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(value)) throw new TypeError('product_slug must be a safe slug');
  return value;
}

function createGeminiImageRequest({ product_slug, prompt, aspect_ratio = '1:1', resolution = '1K', model = MODEL }) {
  safeSlug(product_slug);
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 8000) throw new TypeError('image prompt is required and must have at most 8000 characters');
  if (model !== MODEL) throw new Error('gemini model is not allowlisted');
  if (!ASPECT_RATIOS.has(aspect_ratio)) throw new Error('image aspect ratio is not allowlisted');
  if (!RESOLUTIONS.has(resolution)) throw new Error('image resolution is not allowlisted');
  return Object.freeze({ provider: 'gemini', model, product_slug, prompt: prompt.trim(), response_format: { mime_type: 'image/jpeg', aspect_ratio, resolution } });
}

const ALLOWED_MIME_TYPES = Object.freeze({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' });

function isValidImageSignature(bytes, mimeType) {
  if (mimeType === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  if (mimeType === 'image/jpeg') return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === 'image/webp') return bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
}

function validateGeminiImageResponse(result) {
  const output = result && result.output_image;
  if (!output || typeof output.data !== 'string' || !ALLOWED_MIME_TYPES[output.mime_type]) throw new Error(`provider response does not contain a supported image: ${output && output.mime_type ? output.mime_type : 'missing_mime_type'}`);
  const bytes = Buffer.from(output.data, 'base64');
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error('image byte length is invalid');
  if (!isValidImageSignature(bytes, output.mime_type)) throw new Error('image signature is invalid');
  const usage = result && result.usage && typeof result.usage === 'object' ? result.usage : {};
  const normalizedUsage = {
    ...(Number.isFinite(usage.input_tokens) && usage.input_tokens >= 0 ? { input_tokens: usage.input_tokens } : {}),
    ...(Number.isFinite(usage.output_tokens) && usage.output_tokens >= 0 ? { output_tokens: usage.output_tokens } : {}),
    ...(Number.isFinite(usage.total_tokens) && usage.total_tokens >= 0 ? { total_tokens: usage.total_tokens } : {}),
  };
  return Object.freeze({ bytes, mime_type: output.mime_type, extension: ALLOWED_MIME_TYPES[output.mime_type], request_id: typeof result.id === 'string' ? result.id : null, usage: normalizedUsage });
}

function persistGeneratedImage({ projectRoot, product_slug, slug, image, metadata }) {
  safeSlug(product_slug); safeSlug(slug);
  if (!image || !Buffer.isBuffer(image.bytes)) throw new TypeError('validated image is required');
  const dir = path.resolve(projectRoot, 'meus-produtos', product_slug, 'entregas', 'criativos');
  const root = path.resolve(projectRoot, 'meus-produtos', product_slug);
  if (!dir.startsWith(root + path.sep)) throw new Error('artifact path is outside product');
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const suffix = crypto.randomUUID();
  const artifact_path = path.join(dir, `imagem-${slug}-${suffix}.${image.extension}`);
  const manifest_path = path.join(dir, `imagem-${slug}-${suffix}.json`);
  fs.writeFileSync(artifact_path, image.bytes, { mode: 0o600 });
  const cost_estimate = estimateGeminiImageCost({ resolution: metadata.resolution || '1K', usage: metadata.usage });
  const manifest = { schema_version: 2, provider: metadata.provider, model: metadata.model, request_id: metadata.request_id || null, mime_type: image.mime_type, bytes: image.bytes.length, sha256: crypto.createHash('sha256').update(image.bytes).digest('hex'), artifact: path.basename(artifact_path), generated_at: new Date().toISOString(), cost_estimate, publication: 'not_requested' };
  fs.writeFileSync(manifest_path, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
  return Object.freeze({ artifact_path, manifest_path, ...manifest });
}

function evaluateGeminiApproval({ workflow_id = 'image.generate', product_slug, action_id, approval_policy, now, usage }) {
  if (!approval_policy) return Object.freeze({ allowed: false, reason: 'manual_approval_required' });
  try {
    return Object.freeze(evaluateApproval(approval_policy, { workflow_id, product: product_slug, action_type: 'image.generate', action_id, now, usage }));
  } catch {
    return Object.freeze({ allowed: false, reason: 'approval_policy_invalid' });
  }
}

function executeGeminiImage({ projectRoot, product_slug, slug, prompt, aspect_ratio, resolution, workflow_id = 'image.generate', action_id, approval_policy, now, usage, runner = spawnSync }) {
  const approval = evaluateGeminiApproval({ workflow_id, product_slug, action_id, approval_policy, now, usage });
  if (!approval.allowed) return Object.freeze({ status: 'blocked', reason: approval.reason });
  const request = createGeminiImageRequest({ product_slug, prompt, aspect_ratio, resolution });
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'fluxo-criativo-gemini-'), { encoding: 'utf8' });
  const input = path.join(temp, 'request.json'); const output = path.join(temp, 'response.json');
  try {
    fs.writeFileSync(input, JSON.stringify(request), { mode: 0o600 });
    const run = runner('op', ['run', '--env-file=.env.op', '--', 'node', 'scripts/gemini-nano-banana-runtime.js', input, output], { cwd: projectRoot, encoding: 'utf8', timeout: 100000 });
    if (run.error || !fs.existsSync(output)) throw new Error('gemini runtime failed without a valid response');
    const response = JSON.parse(fs.readFileSync(output, 'utf8'));
    if (!response.ok) {
      const status = Number.isInteger(response.http_status) ? ` (HTTP ${response.http_status})` : '';
      const provider = typeof response.provider_status === 'string' ? ` [${response.provider_status}]` : '';
      const fields = Array.isArray(response.invalid_fields) && response.invalid_fields.length ? ` fields=${response.invalid_fields.join(',')}` : '';
      throw new Error(`gemini runtime failed: ${response.error || 'unknown_error'}${status}${provider}${fields}`);
    }
    const image = validateGeminiImageResponse(response);
    return Object.freeze({ status: 'generated', ...persistGeneratedImage({ projectRoot, product_slug, slug, image, metadata: { provider: 'gemini', model: request.model, request_id: image.request_id, resolution: request.response_format.resolution, usage: image.usage } }) });
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
}

module.exports = { MODEL, createGeminiImageRequest, validateGeminiImageResponse, persistGeneratedImage, executeGeminiImage, estimateGeminiImageCost };
