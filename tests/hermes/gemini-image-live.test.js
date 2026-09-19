'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createApprovalPolicy } = require('../../core/approvals/policy');
const { createGeminiImageRequest, validateGeminiImageResponse, persistGeneratedImage, executeGeminiImage, estimateGeminiImageCost } = require('../../adapters/hermes/gemini-image-live');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-live-'));
try {
  fs.mkdirSync(path.join(root, 'meus-produtos', 'produto', 'entregas', 'criativos'), { recursive: true });
  const request = createGeminiImageRequest({ product_slug: 'produto', prompt: 'Imagem de teste', aspect_ratio: '4:5', resolution: '1K' });
  assert.equal(request.model, 'gemini-3.1-flash-image');
  assert.equal(request.response_format.mime_type, 'image/jpeg');
  let runnerCalled = false;
  const blocked = executeGeminiImage({ projectRoot: root, product_slug: 'produto', slug: 'teste', prompt: 'Imagem de teste', action_id: 'gemini-fixture', runner: () => { runnerCalled = true; } });
  assert.deepEqual(blocked, { status: 'blocked', reason: 'manual_approval_required' });
  assert.equal(runnerCalled, false);
  const wrongGrant = executeGeminiImage({ projectRoot: root, product_slug: 'produto', slug: 'teste', prompt: 'Imagem de teste', action_id: 'gemini-fixture', approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'image.generate', manual_grant: { action_id: 'other-action', approved_by: 'fixture', approved_at: '2026-09-19T00:00:00.000Z' } }), runner: () => { runnerCalled = true; } });
  assert.deepEqual(wrongGrant, { status: 'blocked', reason: 'manual_action_mismatch' });
  assert.equal(runnerCalled, false);
  for (const [policy, reason] of [
    [createApprovalPolicy({ mode: 'manual', workflow_id: 'creative.static', manual_grant: { action_id: 'gemini-fixture', approved_by: 'fixture', approved_at: '2026-09-19T00:00:00.000Z' } }), 'workflow_mismatch'],
    [createApprovalPolicy({ mode: 'manual', workflow_id: 'image.generate', product: 'outro-produto', manual_grant: { action_id: 'gemini-fixture', approved_by: 'fixture', approved_at: '2026-09-19T00:00:00.000Z' } }), 'product_mismatch'],
    [createApprovalPolicy({ mode: 'manual', workflow_id: 'image.generate', action_type: 'other-action', manual_grant: { action_id: 'gemini-fixture', approved_by: 'fixture', approved_at: '2026-09-19T00:00:00.000Z' } }), 'action_type_mismatch'],
  ]) {
    const scoped = executeGeminiImage({ projectRoot: root, product_slug: 'produto', slug: 'teste', prompt: 'Imagem de teste', action_id: 'gemini-fixture', approval_policy: policy, runner: () => { runnerCalled = true; } });
    assert.deepEqual(scoped, { status: 'blocked', reason });
    assert.equal(runnerCalled, false);
  }
  const validPolicy = createApprovalPolicy({ mode: 'manual', workflow_id: 'image.generate', product: 'produto', action_type: 'image.generate', manual_grant: { action_id: 'gemini-fixture', approved_by: 'fixture', approved_at: '2026-09-19T00:00:00.000Z' } });
  const generated = executeGeminiImage({ projectRoot: root, product_slug: 'produto', slug: 'teste', prompt: 'Imagem de teste', action_id: 'gemini-fixture', approval_policy: validPolicy, runner: (_command, args) => { runnerCalled = true; const output = args.at(-1); fs.writeFileSync(output, JSON.stringify({ ok: true, id: 'generated-fixture', output_image: { data: Buffer.from('ffd8ffe00000', 'hex').toString('base64'), mime_type: 'image/jpeg' } })); return {}; } });
  assert.equal(generated.status, 'generated');
  assert.equal(runnerCalled, true);
  assert.throws(() => createGeminiImageRequest({ product_slug: 'produto', prompt: '', aspect_ratio: '4:5' }), /prompt/);
  const png = Buffer.from('89504e470d0a1a0a00000000', 'hex');
  const parsed = validateGeminiImageResponse({ output_image: { data: png.toString('base64'), mime_type: 'image/png' }, id: 'request-safe-id' });
  assert.equal(parsed.mime_type, 'image/png');
  const estimate = estimateGeminiImageCost({ resolution: '1K', usage: { input_tokens: 100 } });
  assert.deepEqual(estimate, {
    status: 'estimated',
    provider_usage: 'available',
    currency: 'USD',
    billing_mode: 'standard',
    input_tokens: 100,
    output_image_usd: 0.067,
    input_text_usd: 0.00005,
    total_usd: 0.06705,
    price_source: 'https://ai.google.dev/gemini-api/docs/pricing',
  });
  const persisted = persistGeneratedImage({ projectRoot: root, product_slug: 'produto', slug: 'teste', image: parsed, metadata: { provider: 'gemini', model: request.model, request_id: 'request-safe-id', resolution: request.response_format.resolution, usage: { input_tokens: 100 } } });
  const manifest = JSON.parse(fs.readFileSync(persisted.manifest_path, 'utf8'));
  assert.deepEqual(manifest.cost_estimate, estimate);
  assert.throws(() => validateGeminiImageResponse({ output_image: { data: Buffer.from('not-image').toString('base64'), mime_type: 'image/png' } }), /signature/);
  console.log('Gemini live image contract: ok');
} finally { fs.rmSync(root, { recursive: true, force: true }); }
