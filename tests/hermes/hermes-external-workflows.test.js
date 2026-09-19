#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs'); const http = require('node:http'); const https = require('node:https'); const net = require('node:net');
const os = require('node:os'); const path = require('node:path');
const { MockSecretProvider } = require('../../core/secrets/provider');
const { createProduct } = require('../../core/local/workflows');
const coreImage = require('../../core/external/image');
const coreResearch = require('../../core/external/research');
const claudeImage = require('../../adapters/claude/image-generation');
const claudeResearch = require('../../adapters/claude/market-research');
const { resolveHermesWorkflow } = require('../../adapters/hermes/resolver');
const { prepareHermesExternalWorkflow, writeHermesMockResult, preserveHermesExternalCacheOnFailure } = require('../../adapters/hermes/external-workflows');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-external-workflows-'));
const slug = 'produto-externo'; const productPath = path.join(fixture, 'meus-produtos', slug);
const available = new MockSecretProvider({ APIFY_API_TOKEN: 'op://fixture/apify/token', META_ACCESS_TOKEN: 'op://fixture/meta/token', GEMINI_API_KEY: 'op://fixture/gemini/key', OPENROUTER_API_KEY: 'op://fixture/openrouter/key', FREEPIK_API_KEY: 'op://fixture/freepik/key', HEYGEN_API_KEY: 'op://fixture/heygen/key', REPLICATE_API_TOKEN: 'op://fixture/replicate/key' });
const unavailable = new MockSecretProvider({ APIFY_API_TOKEN: 'op://fixture/apify/token' }, { APIFY_API_TOKEN: false });
const counters = { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 };
const l3Results = [];
const originals = { fetch: global.fetch, httpRequest: http.request, httpGet: http.get, httpsRequest: https.request, httpsGet: https.get, netConnect: net.connect, child: Object.fromEntries(['exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'execFileSync', 'fork'].map((name) => [name, childProcess[name]])), fs: Object.fromEntries(['writeFileSync', 'appendFileSync', 'renameSync', 'mkdirSync', 'rmSync'].map((name) => [name, fs[name]])) };
function blockedNetwork() { counters.network_calls += 1; throw new Error('network forbidden'); }
function blockedChild() { counters.child_process_calls += 1; throw new Error('child process forbidden'); }
function assertFixtureWrite(target) { if (typeof target === 'number') return; const resolved = path.resolve(String(target)); if (resolved !== fixture && !resolved.startsWith(`${fixture}${path.sep}`)) { counters.writes_outside_fixture += 1; throw new Error(`write outside fixture: ${resolved}`); } }
function installGuards() { if (typeof global.fetch === 'function') global.fetch = blockedNetwork; http.request = blockedNetwork; http.get = blockedNetwork; https.request = blockedNetwork; https.get = blockedNetwork; net.connect = blockedNetwork; for (const name of Object.keys(originals.child)) childProcess[name] = blockedChild; fs.writeFileSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.writeFileSync(target, ...args); }; fs.appendFileSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.appendFileSync(target, ...args); }; fs.renameSync = (from, to, ...args) => { assertFixtureWrite(from); assertFixtureWrite(to); return originals.fs.renameSync(from, to, ...args); }; fs.mkdirSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.mkdirSync(target, ...args); }; fs.rmSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.rmSync(target, ...args); }; }
function restoreGuards() { global.fetch = originals.fetch; http.request = originals.httpRequest; http.get = originals.httpGet; https.request = originals.httpsRequest; https.get = originals.httpsGet; net.connect = originals.netConnect; for (const [name, value] of Object.entries(originals.child)) childProcess[name] = value; for (const [name, value] of Object.entries(originals.fs)) fs[name] = value; }
function researchInput() { return { product_slug: slug, niche: 'educação', quadro: 'resultado', intended_format: 'curso', researched_at: '2026-09-07', axes: coreResearch.RESEARCH_AXES.map((axis) => ({ findings: [{ kind: 'fact', statement: `${axis} em fixture`, source: 'https://example.test/source' }] })) }; }
function assertProductPath(output) { assert.equal(output.startsWith(`${productPath}${path.sep}`), true, `artifact escaped product: ${output}`); }

assert.equal(claudeImage.prepareImageRequest, coreImage.prepareImageRequest, 'image boundary must be shared');
assert.equal(claudeResearch.createResearchArtifact, coreResearch.createResearchArtifact, 'research boundary must be shared');
installGuards();
try {
  createProduct({ projectRoot: fixture, slug, name: 'Produto Externo', type: 'Low Ticket', price: 'R$47' });
  const researchDescriptor = prepareHermesExternalWorkflow({ workflow_id: 'research.market', provider: 'apify', secretProvider: available });
  l3Results.push(researchDescriptor);
  assert.equal(researchDescriptor.support_status, 'HERMES_EXTERNAL_DRY_RUN'); assert.equal(researchDescriptor.result.status, 'dry_run'); assert.equal(researchDescriptor.result.secret_name, 'APIFY_API_TOKEN'); assert.equal(researchDescriptor.external_executable, false);
  const researchUnavailable = prepareHermesExternalWorkflow({ workflow_id: 'research.market', provider: 'apify', secretProvider: unavailable }); assert.equal(researchUnavailable.result.reason, 'secret_unavailable');
  const researchArtifact = writeHermesMockResult({ workflow_id: 'research.market', projectRoot: fixture, research_input: researchInput() }); assertProductPath(researchArtifact.result.artifact_path);
  const researchFailure = preserveHermesExternalCacheOnFailure({ workflow_id: 'research.market', projectRoot: fixture, product_slug: slug, reason: 'provider_error' }); assert.equal(researchFailure.preserved_existing_artifact, true);

  for (const provider of ['gemini', 'openrouter', 'freepik']) { const descriptor = prepareHermesExternalWorkflow({ workflow_id: 'image.generate', provider, prompt: 'imagem mock', secretProvider: available }); l3Results.push(descriptor); assert.equal(descriptor.result.status, 'dry_run'); assert.equal(descriptor.result.required_secret, coreImage.IMAGE_PROVIDERS[provider].secret); const artifact = writeHermesMockResult({ workflow_id: 'image.generate', projectRoot: fixture, product_slug: slug, provider, request_id: `${provider}-job` }); l3Results.push(artifact); assert.equal(artifact.result.status, 'success'); assertProductPath(artifact.result.artifact_path); }
  assert.throws(() => prepareHermesExternalWorkflow({ workflow_id: 'image.generate', provider: 'unknown', prompt: 'x', secretProvider: available }), /allowlisted/);
  assert.equal(prepareHermesExternalWorkflow({ workflow_id: 'image.generate', provider: 'openrouter', prompt: 'x', secretProvider: unavailable }).result.error, 'secret_unavailable');

  const creative = prepareHermesExternalWorkflow({ workflow_id: 'creative.static', brief: 'Brief de criativo', prompt: 'Prompt visual' }); l3Results.push(creative); assert.equal(creative.result.status, 'dry_run'); const creativeArtifact = writeHermesMockResult({ workflow_id: 'creative.static', projectRoot: fixture, product_slug: slug, slug: 'anuncio', brief: 'Brief de criativo', prompt: 'Prompt visual' }); l3Results.push(creativeArtifact); assert.equal(creativeArtifact.result.image_generation, 'not_executed'); assertProductPath(creativeArtifact.result.artifact_path);

  for (const renderer of ['ffmpeg', 'remotion']) { const descriptor = prepareHermesExternalWorkflow({ workflow_id: 'video.generate', renderer, script: 'roteiro' }); l3Results.push(descriptor); assert.equal(descriptor.result.mode, 'LOCAL_RENDER'); assert.equal(descriptor.result.command_plan_only, true); }
  for (const renderer of ['heygen', 'replicate']) { const descriptor = prepareHermesExternalWorkflow({ workflow_id: 'video.generate', renderer, script: 'roteiro', secretProvider: available }); l3Results.push(descriptor); assert.equal(descriptor.result.status, 'dry_run'); const artifact = writeHermesMockResult({ workflow_id: 'video.generate', projectRoot: fixture, product_slug: slug, renderer, job_id: `${renderer}-job` }); l3Results.push(artifact); assert.equal(artifact.result.mime_type, 'video/mp4'); assertProductPath(artifact.result.artifact_path); }
  assert.throws(() => prepareHermesExternalWorkflow({ workflow_id: 'video.generate', renderer: 'unknown', script: 'x' }), /allowlisted/);

  for (const platform of ['instagram', 'tiktok', 'youtube', 'linkedin']) { const descriptor = prepareHermesExternalWorkflow({ workflow_id: 'social.dashboard', platform, secretProvider: available }); l3Results.push(descriptor); assert.equal(descriptor.result.run_status, 'dry_run'); assert.equal(descriptor.result.data.normalized, true); const cache = writeHermesMockResult({ workflow_id: 'social.dashboard', projectRoot: fixture, product_slug: slug, platform, metrics: [{ name: 'views', value: 1 }] }); l3Results.push(cache); assert.equal(cache.result.data.normalized, true); assertProductPath(cache.result.cache_path); const failure = preserveHermesExternalCacheOnFailure({ workflow_id: 'social.dashboard', projectRoot: fixture, product_slug: slug, platform }); l3Results.push(failure); assert.equal(failure.preserved_existing_cache, true); }
  assert.equal(prepareHermesExternalWorkflow({ workflow_id: 'social.dashboard', platform: 'instagram', secretProvider: unavailable }).result.error, 'secret_unavailable');
  assert.equal(prepareHermesExternalWorkflow({ workflow_id: 'social.dashboard', platform: 'instagram', secretProvider: available, provider_error: true }).result.error, 'provider_error');

  for (const workflowId of ['research.market', 'image.generate', 'creative.static', 'video.generate', 'social.dashboard']) { const resolution = resolveHermesWorkflow(workflowId); assert.equal(resolution.support_status, 'HERMES_EXTERNAL_DRY_RUN'); assert.equal(resolution.local_executable, true); assert.equal(resolution.external_executable, false); }
  const serialized = JSON.stringify(l3Results);
  assert.equal(/Bearer\s|EAA[A-Za-z0-9]{10,}|sk-[A-Za-z0-9]|access_token=|password=|api_key=/i.test(serialized), false, 'external result leaked plausible plaintext secret');
  assert.equal(counters.network_calls, 0); assert.equal(counters.child_process_calls, 0); assert.equal(counters.writes_outside_fixture, 0);
} finally { restoreGuards(); fs.rmSync(fixture, { recursive: true, force: true }); }
assert.equal(fs.existsSync(fixture), false);
process.stdout.write('Hermes external workflow parity: ok\n');
