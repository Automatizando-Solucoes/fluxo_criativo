#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict'); const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const { MockSecretProvider } = require('../../core/secrets/provider'); const { createProduct } = require('../../core/local/workflows'); const { prepareCodexExternalWorkflow, writeCodexMockResult, preserveCodexExternalCacheOnFailure } = require('../../adapters/codex/external-workflows');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-external-')); const secrets = new MockSecretProvider({ APIFY_API_TOKEN: 'op://fixture/apify/token', META_ACCESS_TOKEN: 'op://fixture/meta/token', OPENROUTER_API_KEY: 'op://fixture/openrouter/key', FREEPIK_API_KEY: 'op://fixture/freepik/key', HEYGEN_API_KEY: 'op://fixture/heygen/key', REPLICATE_API_TOKEN: 'op://fixture/replicate/token' });
try {
  createProduct({ projectRoot: root, slug: 'produto', name: 'Produto', type: 'Low Ticket', price: 'R$47' });
  for (const provider of ['apify', 'ads_library']) assert.equal(prepareCodexExternalWorkflow({ workflow_id: 'research.market', provider, secretProvider: secrets }).result.status, 'dry_run');
  for (const provider of ['openrouter', 'freepik']) assert.equal(prepareCodexExternalWorkflow({ workflow_id: 'image.generate', provider, prompt: 'Prompt seguro', secretProvider: secrets }).result.status, 'dry_run');
  for (const renderer of ['ffmpeg', 'remotion', 'heygen', 'replicate']) assert.equal(prepareCodexExternalWorkflow({ workflow_id: 'video.generate', renderer, script: 'Roteiro', secretProvider: secrets }).result.status, 'dry_run');
  for (const platform of ['instagram', 'tiktok', 'youtube', 'linkedin']) assert.equal(prepareCodexExternalWorkflow({ workflow_id: 'social.dashboard', platform, secretProvider: secrets }).result.status, 'READY_EXTERNAL');
  assert.equal(prepareCodexExternalWorkflow({ workflow_id: 'creative.static', brief: 'Brief seguro' }).result.capability, 'image.generate');
  const axes = require('../../core/external/research').RESEARCH_AXES.map((axis) => ({ findings: [{ kind: 'fact', statement: `${axis} mock`, source: 'https://example.test/source' }] }));
  const research = writeCodexMockResult({ workflow_id: 'research.market', projectRoot: root, research_input: { product_slug: 'produto', niche: 'educação', quadro: 'resultado', intended_format: 'curso', researched_at: '2026-09-07', axes } });
  assert.equal(research.result.status, 'ready'); assert.equal(preserveCodexExternalCacheOnFailure({ workflow_id: 'research.market', projectRoot: root, product_slug: 'produto', reason: 'source_failed' }).preserved_existing_artifact, true);
  assert.throws(() => prepareCodexExternalWorkflow({ workflow_id: 'image.generate', provider: 'unknown', prompt: 'x', secretProvider: secrets }));
} finally { fs.rmSync(root, { recursive: true, force: true }); }
process.stdout.write('Codex external workflows: ok\n');
