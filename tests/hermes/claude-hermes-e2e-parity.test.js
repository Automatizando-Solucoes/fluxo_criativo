#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');

const { createApprovalPolicy } = require('../../core/approvals/policy');
const { RESEARCH_AXES } = require('../../core/external/research');
const { REQUIRED_HT_COMMANDS } = require('../../core/external/high-ticket-status');
const { createProduct } = require('../../core/local/workflows');
const { getProductPath } = require('../../core/state/product-state');
const { MockSecretProvider } = require('../../core/secrets/provider');
const { workflowRegistry } = require('../../core/workflows/registry');
const claudeLocal = require('../../adapters/claude/product-workflow');
const claudeResearch = require('../../adapters/claude/market-research');
const claudeImage = require('../../adapters/claude/image-generation');
const claudeVideo = require('../../adapters/claude/video-generation');
const claudeDashboard = require('../../adapters/claude/social-dashboard');
const claudeMeta = require('../../adapters/claude/meta-ads');
const claudeReport = require('../../adapters/claude/ads-report');
const claudePlan = require('../../adapters/claude/plan-executor');
const claudeToolkit = require('../../adapters/claude/toolkit-workflow');
const claudePublisher = require('../../adapters/claude/organic-publisher');
const claudeHighTicket = require('../../adapters/claude/high-ticket-status');
const { buildHermesParityMatrix } = require('../../adapters/hermes/parity');
const { prepareHermesExternalWorkflow, preserveHermesExternalCacheOnFailure, writeHermesMockResult } = require('../../adapters/hermes/external-workflows');
const { getHermesHighTicketStatus } = require('../../adapters/hermes/high-ticket-status');
const { executeHermesLocalWorkflow } = require('../../adapters/hermes/local-workflows');
const { buildHermesAdsReport, createHermesCampaignDraft, createHermesReportDelivery, prepareHermesMetaOperation, prepareHermesMetaWorkflow } = require('../../adapters/hermes/meta-workflows');
const { createHermesCarouselSchedule, createHermesToolkit, pauseHermesToolkit, reevaluateHermesToolkit, resolveHermesPlan, resumeHermesToolkit, transitionHermesToolkit } = require('../../adapters/hermes/orchestration-workflows');
const { createHermesPublicationRequest, evaluateHermesPublication } = require('../../adapters/hermes/publisher-workflow');
const { WRAPPER_PATHS, resolveHermesWorkflow } = require('../../adapters/hermes/resolver');

const suiteRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-hermes-parity-'));
const claudeRoot = path.join(suiteRoot, 'claude');
const hermesRoot = path.join(suiteRoot, 'hermes');
const slug = 'produto-paridade';
const counters = { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 };
const collected = [];
const coverage = new Map(workflowRegistry.list().map((workflow) => [workflow.id, { workflow_id: workflow.id, tested_in_e2e: false }]));
const originals = {
  fetch: global.fetch, httpRequest: http.request, httpGet: http.get, httpsRequest: https.request, httpsGet: https.get, netConnect: net.connect,
  child: Object.fromEntries(['exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'execFileSync', 'fork'].map((name) => [name, childProcess[name]])),
  fs: Object.fromEntries(['writeFileSync', 'appendFileSync', 'renameSync', 'mkdirSync', 'rmSync'].map((name) => [name, fs[name]])),
};

function blockNetwork() { counters.network_calls += 1; throw new Error('network forbidden in Claude/Hermes E2E parity'); }
function blockChild() { counters.child_process_calls += 1; throw new Error('child process forbidden in Claude/Hermes E2E parity'); }
function assertFixtureWrite(target) {
  if (typeof target === 'number') return;
  const resolved = path.resolve(String(target));
  if (resolved !== suiteRoot && !resolved.startsWith(`${suiteRoot}${path.sep}`)) { counters.writes_outside_fixture += 1; throw new Error(`write outside fixture: ${resolved}`); }
}
function installGuards() {
  if (typeof global.fetch === 'function') global.fetch = blockNetwork;
  http.request = blockNetwork; http.get = blockNetwork; https.request = blockNetwork; https.get = blockNetwork; net.connect = blockNetwork;
  for (const name of Object.keys(originals.child)) childProcess[name] = blockChild;
  fs.writeFileSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.writeFileSync(target, ...args); };
  fs.appendFileSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.appendFileSync(target, ...args); };
  fs.renameSync = (from, to, ...args) => { assertFixtureWrite(from); assertFixtureWrite(to); return originals.fs.renameSync(from, to, ...args); };
  fs.mkdirSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.mkdirSync(target, ...args); };
  fs.rmSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.rmSync(target, ...args); };
}
function restoreGuards() {
  global.fetch = originals.fetch; http.request = originals.httpRequest; http.get = originals.httpGet; https.request = originals.httpsRequest; https.get = originals.httpsGet; net.connect = originals.netConnect;
  for (const [name, value] of Object.entries(originals.child)) childProcess[name] = value;
  for (const [name, value] of Object.entries(originals.fs)) fs[name] = value;
}
function relative(value) {
  if (typeof value !== 'string') return value;
  if (value.startsWith(claudeRoot)) return value.slice(claudeRoot.length + 1);
  if (value.startsWith(hermesRoot)) return value.slice(hermesRoot.length + 1);
  return value;
}
function select(value, fields) {
  return Object.fromEntries(fields.map((field) => [field, field.includes('.') ? field.split('.').reduce((item, key) => item == null ? undefined : item[key], value) : value[field]]));
}
function assertParity(label, claudeResult, hermesResult, fields) {
  assert.deepEqual(select(claudeResult, fields), select(hermesResult, fields), `${label} contract diverged`);
}
function mark(...ids) { for (const id of ids) coverage.get(id).tested_in_e2e = true; }
function manual(workflowId, actionId) {
  return createApprovalPolicy({ mode: 'manual', workflow_id: workflowId, manual_grant: { action_id: actionId, approved_by: 'fixture', approved_at: '2026-09-07T00:00:00.000Z' } });
}
function researchInput() {
  return { product_slug: slug, niche: 'educação', quadro: 'Ajudar alunos a aprender', intended_format: 'curso', researched_at: '2026-09-07', axes: RESEARCH_AXES.map((axis) => ({ findings: [{ kind: 'fact', statement: `${axis} em fixture`, source: 'https://example.test/fonte' }] })) };
}
function pageCopy() { return Array.from({ length: 16 }, (_, index) => `## Bloco ${String(index + 1).padStart(2, '0')}\nTexto específico validado.`).join('\n\n'); }
function createKnowledge(root) { const product = getProductPath(slug, root); for (const file of ['pesquisa-mercado.md', 'perfil.md', 'idconsumidor.md']) fs.writeFileSync(path.join(product, file), '# Fixture\n'); }
function localClaude(input) {
  const workflowId = input.workflow_id;
  if (workflowId === 'product.create') return claudeLocal.createProduct({ projectRoot: input.projectRoot, slug: input.product_slug, name: input.name, type: input.type, price: input.price });
  if (workflowId === 'product.select') return claudeLocal.activateProduct({ projectRoot: input.projectRoot, slug: input.product_slug });
  if (workflowId.startsWith('copy.')) { const review = claudeLocal.reviewCopy({ workflow_id: workflowId, content: input.content }); return claudeLocal.saveReviewedCopy({ projectRoot: input.projectRoot, product_slug: input.product_slug, workflow_id: workflowId, content: input.content, review }); }
  if (workflowId === 'funnel.low_ticket') return claudeLocal.createLowTicketPlan({ projectRoot: input.projectRoot, product_slug: input.product_slug, quiz_required: input.quiz_required });
  if (workflowId === 'funnel.middle_ticket') return claudeLocal.createMiddleTicketPlan({ projectRoot: input.projectRoot, product_slug: input.product_slug });
  if (workflowId === 'page.sales') return claudeLocal.buildPage({ projectRoot: input.projectRoot, product_slug: input.product_slug, html: input.html, copy_review: input.copy_review });
  if (workflowId === 'carousel.generate') return claudeLocal.createCarouselArtifact(input);
  if (workflowId === 'carousel.schedule') return claudeLocal.createCarouselSchedule(input);
  if (workflowId === 'commercial.playbook') return claudeLocal.planCommercial(input);
  throw new Error(`unsupported Claude local fixture workflow: ${workflowId}`);
}
function assertNoLiveInvoker(moduleFile) {
  const source = fs.readFileSync(path.join(path.resolve(__dirname, '../..'), moduleFile), 'utf8');
  assert.equal(/\bfetch\s*\(|\b(?:http|https)\.request\s*\(|\bnet\.connect\s*\(|\b(?:exec|spawn|fork)\s*\(/.test(source), false, `${moduleFile} must not invoke a live runtime`);
}

fs.mkdirSync(claudeRoot); fs.mkdirSync(hermesRoot);
installGuards();
try {
  const secrets = new MockSecretProvider({
    META_ACCESS_TOKEN: 'op://fixture/meta/token', APIFY_API_TOKEN: 'op://fixture/apify/token', OPENROUTER_API_KEY: 'op://fixture/openrouter/token',
    FREEPIK_API_KEY: 'op://fixture/freepik/token', HEYGEN_API_KEY: 'op://fixture/heygen/token', REPLICATE_API_TOKEN: 'op://fixture/replicate/token',
  });

  // Product state remains isolated even with identical semantic input.
  const productInput = { workflow_id: 'product.create', product_slug: slug, name: 'Produto Paridade', type: 'Low Ticket', price: 'R$47' };
  const claudeProduct = localClaude({ ...productInput, projectRoot: claudeRoot });
  const hermesProduct = executeHermesLocalWorkflow({ ...productInput, projectRoot: hermesRoot }).result;
  assertParity('product.create', claudeProduct, hermesProduct, ['slug', 'manifest.schema_version', 'manifest.ativo']); mark('product.create');
  assert.equal(fs.readFileSync(path.join(claudeRoot, 'meus-produtos', '.ativo'), 'utf8'), fs.readFileSync(path.join(hermesRoot, 'meus-produtos', '.ativo'), 'utf8'));
  assert.throws(() => localClaude({ ...productInput, projectRoot: claudeRoot }), /already exists/);
  assert.throws(() => executeHermesLocalWorkflow({ ...productInput, projectRoot: hermesRoot }), /already exists/);
  assert.throws(() => localClaude({ ...productInput, projectRoot: claudeRoot, product_slug: '../unsafe' }), /slug/);
  assert.throws(() => executeHermesLocalWorkflow({ ...productInput, projectRoot: hermesRoot, product_slug: '../unsafe' }), /slug/);
  assert.throws(() => localClaude({ ...productInput, projectRoot: claudeRoot, product_slug: 'tipo-invalido', type: 'High Ticket' }), /type/);
  assert.throws(() => executeHermesLocalWorkflow({ ...productInput, projectRoot: hermesRoot, product_slug: 'tipo-invalido', type: 'High Ticket' }), /type/);
  const claudeSelected = localClaude({ workflow_id: 'product.select', projectRoot: claudeRoot, product_slug: slug });
  const hermesSelected = executeHermesLocalWorkflow({ workflow_id: 'product.select', projectRoot: hermesRoot, product_slug: slug }).result;
  assertParity('product.select', claudeSelected, hermesSelected, ['slug', 'manifest.schema_version', 'manifest.ativo']); mark('product.select');
  createKnowledge(claudeRoot); createKnowledge(hermesRoot);

  // Copy uses the identical review gate, but compares only business fields and artifact categories.
  const copyInputs = [
    ['copy.page', pageCopy(), { page_type: 'vendas' }], ['copy.ad', 'Texto específico validado.', { offer: 'Oferta fixture' }],
    ['copy.social', 'Texto específico validado.', { platform: 'instagram' }], ['copy.script', 'Roteiro específico validado.', { objective: 'vender' }],
  ];
  const copyResults = new Map();
  for (const [workflowId, content, inputs] of copyInputs) {
    const claude = localClaude({ workflow_id: workflowId, projectRoot: claudeRoot, product_slug: slug, content, ...inputs });
    const hermes = executeHermesLocalWorkflow({ workflow_id: workflowId, projectRoot: hermesRoot, product_slug: slug, content, ...inputs }).result;
    assertParity(workflowId, { ...claude, output_path: relative(claude.output_path) }, { ...hermes, output_path: relative(hermes.output_path) }, ['status', 'workflow_id', 'review.status', 'review.reviewer', 'review.required_knowledge', 'output_path']);
    copyResults.set(workflowId, { claude, hermes }); mark(workflowId);
  }
  const rejectedClaude = claudeLocal.reviewCopy({ workflow_id: 'copy.social', content: 'Texto inválido!' });
  const rejectedHermes = claudeLocal.reviewCopy({ workflow_id: 'copy.social', content: 'Texto inválido!' });
  assertParity('copy rejection', rejectedClaude, rejectedHermes, ['status', 'workflow_id', 'issues']);
  assert.throws(() => localClaude({ workflow_id: 'copy.social', projectRoot: claudeRoot, product_slug: slug, platform: 'instagram', content: 'Texto inválido!' }), /review gate/);
  assert.throws(() => executeHermesLocalWorkflow({ workflow_id: 'copy.social', projectRoot: hermesRoot, product_slug: slug, platform: 'instagram', content: 'Texto inválido!' }), /review gate/);
  assert.equal(executeHermesLocalWorkflow({ workflow_id: 'copy.social', projectRoot: hermesRoot, product_slug: slug, platform: 'instagram', content: 'Texto válido.' }).publication.autopublish, false);

  const lowClaude = localClaude({ workflow_id: 'funnel.low_ticket', projectRoot: claudeRoot, product_slug: slug, quiz_required: true });
  const lowHermes = executeHermesLocalWorkflow({ workflow_id: 'funnel.low_ticket', projectRoot: hermesRoot, product_slug: slug, quiz_required: true }).result;
  assertParity('funnel.low_ticket', lowClaude.plan, lowHermes.plan, ['workflow_id', 'steps', 'traffic_handoff.mode', 'traffic_handoff.approval', 'traffic_handoff.campaign_creation']); mark('funnel.low_ticket');
  assert.equal(lowClaude.plan.traffic_handoff.campaign_creation, 'PAUSED');
  const middleClaude = localClaude({ workflow_id: 'funnel.middle_ticket', projectRoot: claudeRoot, product_slug: slug });
  const middleHermes = executeHermesLocalWorkflow({ workflow_id: 'funnel.middle_ticket', projectRoot: hermesRoot, product_slug: slug }).result;
  assertParity('funnel.middle_ticket', middleClaude.plan, middleHermes.plan, ['workflow_id', 'steps', 'traffic_handoff.mode', 'traffic_handoff.approval', 'traffic_handoff.external_capability_granted']); mark('funnel.middle_ticket');

  const html = '<html><body><img src="assets/mock.png"></body></html>';
  const pageClaude = localClaude({ workflow_id: 'page.sales', projectRoot: claudeRoot, product_slug: slug, html, copy_review: copyResults.get('copy.page').claude.review });
  const pageHermes = executeHermesLocalWorkflow({ workflow_id: 'page.sales', projectRoot: hermesRoot, product_slug: slug, html, copy_review: copyResults.get('copy.page').hermes.review }).result;
  assertParity('page.sales', { ...pageClaude, output_path: relative(pageClaude.output_path) }, { ...pageHermes, output_path: relative(pageHermes.output_path) }, ['status', 'output_path', 'deploy.mode', 'deploy.approved']); mark('page.sales');
  assert.throws(() => localClaude({ workflow_id: 'page.sales', projectRoot: claudeRoot, product_slug: slug, html: '<html><body><img src="https://invalid.test/x"></body></html>', copy_review: copyResults.get('copy.page').claude.review }), /relative paths/);
  assert.throws(() => executeHermesLocalWorkflow({ workflow_id: 'page.sales', projectRoot: hermesRoot, product_slug: slug, html: '<html><body><img src="https://invalid.test/x"></body></html>', copy_review: copyResults.get('copy.page').hermes.review }), /relative paths/);

  const carouselInput = { workflow_id: 'carousel.generate', product_slug: slug, slug: 'lancamento', slides: ['Um', 'Dois'], caption: 'Legenda', cta: 'CTA', visual_prompts: ['Prompt um', 'Prompt dois'] };
  const carouselClaude = localClaude({ ...carouselInput, projectRoot: claudeRoot }); const carouselHermes = executeHermesLocalWorkflow({ ...carouselInput, projectRoot: hermesRoot }).result;
  assertParity('carousel.generate', carouselClaude.artifact, carouselHermes.artifact, ['kind', 'slug', 'slides', 'caption', 'cta', 'visual_prompts', 'publication.autopublish', 'publication.status']); mark('carousel.generate');
  const scheduleInput = { workflow_id: 'carousel.schedule', product_slug: slug, slug: 'lancamento', schedule_id: 'schedule-1', schedule: '0 9 * * *', timezone: 'America/Manaus' };
  const scheduleClaude = localClaude({ ...scheduleInput, projectRoot: claudeRoot }); const scheduleHermes = executeHermesLocalWorkflow({ ...scheduleInput, projectRoot: hermesRoot }).result;
  assertParity('carousel.schedule', scheduleClaude.descriptor, scheduleHermes.descriptor, ['schedule_id', 'schedule', 'timezone', 'publication', 'relatorio_cron_id', 'mode']); assert.equal(scheduleHermes.descriptor.publication, false); mark('carousel.schedule');
  assert.equal(createHermesCarouselSchedule({ ...scheduleInput, projectRoot: hermesRoot }).scheduled, false);
  const commercialClaude = localClaude({ workflow_id: 'commercial.playbook', product_slug: slug }); const commercialHermes = executeHermesLocalWorkflow({ workflow_id: 'commercial.playbook', projectRoot: hermesRoot, product_slug: slug }).result;
  assertParity('commercial general', commercialClaude, commercialHermes, ['status', 'module', 'outputs']);
  const commercialHtClaude = localClaude({ workflow_id: 'commercial.playbook', product_slug: slug, module: 'COMMERCIAL_HT', existing_artifacts: ['existente.md'] }); const commercialHtHermes = executeHermesLocalWorkflow({ workflow_id: 'commercial.playbook', projectRoot: hermesRoot, product_slug: slug, module: 'COMMERCIAL_HT', existing_artifacts: ['existente.md'] }).result;
  assertParity('commercial HT', commercialHtClaude, commercialHtHermes, ['status', 'dependency', 'reason', 'existing_artifacts']); mark('commercial.playbook');

  // L3 external boundaries remain dry-run and preserve local artifacts/cache on failure.
  const researchClaude = claudeResearch.prepareSpecializedResearchProvider({ provider: 'apify', secretProvider: secrets }); const researchHermes = prepareHermesExternalWorkflow({ workflow_id: 'research.market', provider: 'apify', secretProvider: secrets }).result;
  assertParity('research descriptor', researchClaude, researchHermes, ['status', 'provider', 'operation_id', 'secret_name', 'external_executable']);
  const researchArtifactClaude = claudeResearch.createResearchArtifact({ projectRoot: claudeRoot, input: researchInput() }); const researchArtifactHermes = writeHermesMockResult({ workflow_id: 'research.market', projectRoot: hermesRoot, research_input: researchInput() }).result;
  assertParity('research artifact', { ...researchArtifactClaude, artifact_path: relative(researchArtifactClaude.artifact_path) }, { ...researchArtifactHermes, artifact_path: relative(researchArtifactHermes.artifact_path) }, ['status', 'artifact_path', 'review.agent']);
  const researchFailureClaude = claudeResearch.preserveExistingResearchOnSourceFailure({ projectRoot: claudeRoot, product_slug: slug, reason: 'provider_error' }); const researchFailureHermes = preserveHermesExternalCacheOnFailure({ workflow_id: 'research.market', projectRoot: hermesRoot, product_slug: slug, reason: 'provider_error' });
  assertParity('research failure', researchFailureClaude, researchFailureHermes, ['status', 'reason', 'preserved_existing_artifact']); mark('research.market');
  for (const provider of ['openrouter', 'freepik']) {
    const claude = claudeImage.prepareImageRequest({ provider, prompt: 'imagem fixture', secretProvider: secrets }); const hermes = prepareHermesExternalWorkflow({ workflow_id: 'image.generate', provider, prompt: 'imagem fixture', secretProvider: secrets }).result;
    assertParity(`image ${provider}`, claude, hermes, ['provider', 'status', 'operation', 'required_secret', 'external_executable']);
    const cArtifact = claudeImage.writeMockImageArtifact({ projectRoot: claudeRoot, product_slug: slug, provider, request_id: `${provider}-id` }); const hArtifact = writeHermesMockResult({ workflow_id: 'image.generate', projectRoot: hermesRoot, product_slug: slug, provider, request_id: `${provider}-id` }).result;
    assertParity(`image artifact ${provider}`, { ...cArtifact, artifact_path: relative(cArtifact.artifact_path) }, { ...hArtifact, artifact_path: relative(hArtifact.artifact_path) }, ['provider', 'status', 'artifact_path', 'mime_type', 'width', 'height', 'request_id', 'error']);
  }
  assert.throws(() => claudeImage.prepareImageRequest({ provider: 'invalid', prompt: 'x', secretProvider: secrets }), /allowlisted/); assert.throws(() => prepareHermesExternalWorkflow({ workflow_id: 'image.generate', provider: 'invalid', prompt: 'x', secretProvider: secrets }), /allowlisted/); mark('image.generate');
  const creativeHermes = prepareHermesExternalWorkflow({ workflow_id: 'creative.static', brief: 'Brief de criativo', prompt: 'Prompt visual' }).result; const creativeClaude = { status: 'dry_run', capability: 'image.generate', prompt: 'Prompt visual', external_executable: false };
  assertParity('creative.static', creativeClaude, creativeHermes, ['status', 'capability', 'prompt', 'external_executable']); mark('creative.static');
  for (const renderer of ['ffmpeg', 'remotion', 'heygen', 'replicate']) {
    const claude = claudeVideo.prepareVideoJob({ renderer, script: 'Roteiro fixture', secretProvider: secrets }); const hermes = prepareHermesExternalWorkflow({ workflow_id: 'video.generate', renderer, script: 'Roteiro fixture', secretProvider: secrets }).result;
    assertParity(`video ${renderer}`, claude, hermes, ['renderer', 'mode', 'status', 'command_plan_only', 'required_secret', 'external_executable']);
  }
  const videoClaude = claudeVideo.writeMockVideoResult({ projectRoot: claudeRoot, product_slug: slug, renderer: 'heygen', job_id: 'video-id' }); const videoHermes = writeHermesMockResult({ workflow_id: 'video.generate', projectRoot: hermesRoot, product_slug: slug, renderer: 'heygen', job_id: 'video-id' }).result;
  assertParity('video artifact', { ...videoClaude, artifact_path: relative(videoClaude.artifact_path) }, { ...videoHermes, artifact_path: relative(videoHermes.artifact_path) }, ['renderer', 'job_id', 'status', 'artifact_path', 'mime_type', 'error']); mark('video.generate');
  for (const platform of ['instagram', 'tiktok', 'youtube', 'linkedin']) {
    const claude = claudeDashboard.prepareDashboard({ platform, secretProvider: secrets }); const hermes = prepareHermesExternalWorkflow({ workflow_id: 'social.dashboard', platform, secretProvider: secrets }).result;
    assertParity(`dashboard ${platform}`, claude, hermes, ['platform', 'provider', 'capability', 'logical_secret', 'cache', 'run_status', 'external_executable']);
    const cCache = claudeDashboard.writeMockDashboardCache({ projectRoot: claudeRoot, product_slug: slug, platform, metrics: [{ name: 'views', value: 1 }] }); const hCache = writeHermesMockResult({ workflow_id: 'social.dashboard', projectRoot: hermesRoot, product_slug: slug, platform, metrics: [{ name: 'views', value: 1 }] }).result;
    assertParity(`dashboard cache ${platform}`, { ...cCache, cache_path: relative(cCache.cache_path) }, { ...hCache, cache_path: relative(hCache.cache_path) }, ['status', 'cache_path', 'data.normalized', 'data.provider']);
    assert.equal(claudeDashboard.preserveDashboardCacheOnProviderError({ projectRoot: claudeRoot, product_slug: slug, platform }).preserved_existing_cache, true);
    assert.equal(preserveHermesExternalCacheOnFailure({ workflow_id: 'social.dashboard', projectRoot: hermesRoot, product_slug: slug, platform }).preserved_existing_cache, true);
  }
  mark('social.dashboard');

  const readOperations = ['meta.auth.validate', 'meta.accounts.list', 'ads.account.read', 'ads.campaigns.list', 'ads.pixels.list', 'ads.conversions.list', 'ads.audiences.list', 'ads.interests.search', 'ads.creatives.validate', 'ads.insights'];
  for (const operation of readOperations) {
    const claude = claudeMeta.prepareMetaOperation({ operation, auth_mode: 'MCP_CONECTOR' }); const hermes = prepareHermesMetaOperation({ operation, auth_mode: 'MCP_CONECTOR' }).result;
    assertParity(`Meta MCP read ${operation}`, claude, hermes, ['status', 'operation', 'secret_name', 'auth_mode', 'transport', 'oauth_managed_externally', 'external', 'financial', 'approval_required']);
  }
  assert.equal(claudeMeta.prepareMetaOperation({ operation: 'ads.insights', auth_mode: 'APP' }).reason, prepareHermesMetaOperation({ operation: 'ads.insights', auth_mode: 'APP' }).result.reason);
  assert.equal(claudeMeta.prepareMetaOperation({ operation: 'ads.insights', auth_mode: 'APP', secretProvider: secrets }).status, prepareHermesMetaOperation({ operation: 'ads.insights', auth_mode: 'APP', secretProvider: secrets }).result.status); mark('ads.insights');
  const createContext = { workflow_id: 'ads.campaign.create', action_id: 'create-action' };
  for (const policy of [undefined, manual('ads.campaign.create', 'wrong'), manual('ads.campaign.create', 'create-action')]) {
    const claude = claudeMeta.prepareMetaOperation({ operation: 'ads.campaign.create', policy, context: createContext, secretProvider: secrets }); const hermes = prepareHermesMetaWorkflow({ workflow_id: 'ads.campaign.create', policy, context: createContext, secretProvider: secrets }).result;
    assertParity('Meta create approval', claude, hermes, ['status', 'reason', 'operation', 'category', 'external', 'financial', 'approval_required']);
  }
  const cDraft = claudeMeta.createPausedCampaignDraft({ name: 'Campanha fixture', action_id: 'create-action' }); const hDraft = createHermesCampaignDraft({ name: 'Campanha fixture', action_id: 'create-action' }).draft;
  assertParity('campaign draft', cDraft, hDraft, ['action_id', 'name', 'status', 'execution']); assert.equal(cDraft.status, 'PAUSED'); mark('ads.campaign.create');
  for (const operation of ['ads.optimize', 'ads.campaign.update_status']) {
    const policy = manual(operation, 'typed-action'); const context = { workflow_id: operation, action_id: 'typed-action' };
    assertParity(operation, claudeMeta.prepareMetaOperation({ operation, policy, context, secretProvider: secrets }), prepareHermesMetaOperation({ operation, policy, context, secretProvider: secrets }).result, ['status', 'operation', 'category', 'financial', 'approval_required']);
  }
  mark('ads.optimize');
  const scaleContext = { workflow_id: 'ads.scale', action_id: 'scale-action' };
  for (const policy of [undefined, createApprovalPolicy({ mode: 'standing', workflow_id: 'ads.scale', authorized_by: 'fixture' }), manual('ads.scale', 'wrong'), manual('ads.scale', 'scale-action')]) {
    const claude = claudeMeta.prepareMetaOperation({ operation: 'ads.scale', policy, context: scaleContext, secretProvider: secrets }); const hermes = prepareHermesMetaWorkflow({ workflow_id: 'ads.scale', policy, context: scaleContext, secretProvider: secrets }).result;
    assertParity('Meta scale approval', claude, hermes, ['status', 'reason', 'operation', 'category', 'financial', 'approval_required']);
  }
  assert.equal(prepareHermesMetaWorkflow({ workflow_id: 'ads.scale', auth_mode: 'MCP_CONECTOR', policy: manual('ads.scale', 'scale-action'), context: scaleContext }).result.status, 'dry_run'); mark('ads.scale');
  const metrics = { spend: 0, reach: 10, impressions: 20, clicks: 1, ctr: 5, cpm: 0, cpc: 0, results: 0, cost_per_result: null };
  const reportClaude = claudeReport.createAdsReport({ projectRoot: claudeRoot, product_slug: slug, period: '2026-09', metrics, analysis: 'Análise mock.' }); const reportHermes = buildHermesAdsReport({ projectRoot: hermesRoot, product_slug: slug, period: '2026-09', metrics, analysis: 'Análise mock.' }).result;
  assertParity('ads.report', { ...reportClaude, artifact_path: relative(reportClaude.artifact_path) }, { ...reportHermes, artifact_path: relative(reportHermes.artifact_path) }, ['status', 'artifact_path', 'period', 'delivery']);
  const deliveryClaude = claudeReport.createReportDelivery({ channel: 'telegram', artifact_path: reportClaude.artifact_path }); const deliveryHermes = createHermesReportDelivery({ channel: 'telegram', artifact_path: reportHermes.artifact_path });
  assertParity('report delivery descriptor', { ...deliveryClaude, artifact_path: 'artifact' }, { ...deliveryHermes, artifact_path: 'artifact' }, ['channel', 'artifact_path', 'sent', 'dry_run', 'mode', 'relatorio_cron_id_scope']); mark('ads.report');
  const alias = resolveHermesWorkflow('traffic.insights'); assert.deepEqual(select(alias, ['requested_workflow_id', 'workflow_id', 'compatibility_alias_of']), { requested_workflow_id: 'traffic.insights', workflow_id: 'ads.insights', compatibility_alias_of: 'ads.insights' }); mark('traffic.insights');

  const taskSet = [
    { task_id: 'copy', workflow_id: 'copy.social' }, { task_id: 'insights', workflow_id: 'ads.insights' },
    { task_id: 'create', workflow_id: 'ads.campaign.create' }, { task_id: 'scale', workflow_id: 'ads.scale', action_id: 'scale-plan', approval_policy: manual('ads.scale', 'scale-plan') },
    { task_id: 'unknown', workflow_id: 'missing.workflow' }, { task_id: 'dependent', workflow_id: 'copy.page', depends_on: ['unknown'] },
  ];
  const planClaude = claudePlan.resolvePlan(taskSet, workflowRegistry); const planHermes = resolveHermesPlan({ product_slug: slug, tasks: taskSet }).result;
  assertParity('plan.execute', planClaude, planHermes, ['status', 'dispatch']);
  assert.deepEqual(planClaude.tasks.map((task) => select(task, ['task_id', 'workflow_id', 'status', 'reason', 'external', 'financial', 'approval_required', 'kind', 'risk_from_children'])), planHermes.tasks.map((task) => select(task, ['task_id', 'workflow_id', 'status', 'reason', 'external', 'financial', 'approval_required', 'kind', 'risk_from_children']))); mark('plan.execute');
  assert.equal(claudePlan.resolvePlan([{ task_id: 'parent', workflow_id: 'plan.execute' }], workflowRegistry).tasks[0].reason, 'child_tasks_required'); assert.equal(resolveHermesPlan({ product_slug: slug, tasks: [{ task_id: 'parent', workflow_id: 'plan.execute' }] }).result.tasks[0].reason, 'child_tasks_required');

  const toolkitTasks = [{ id: 'one', workflow_id: 'copy.social' }, { id: 'two', workflow_id: 'copy.page', depends_on: ['one'] }, { id: 'blocked', workflow_id: 'ads.campaign.create' }];
  const cToolkit = claudeToolkit.createProductToolkit({ projectRoot: claudeRoot, product_slug: slug, id: 'parity', tasks: toolkitTasks, registry: workflowRegistry }); const hToolkit = createHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity', tasks: toolkitTasks });
  assert.deepEqual(cToolkit.state.tasks.map((task) => select(task, ['id', 'workflow_id', 'status', 'reason', 'external', 'financial', 'approval_required', 'idempotency_key'])), hToolkit.result.state.tasks.map((task) => select(task, ['id', 'workflow_id', 'status', 'reason', 'external', 'financial', 'approval_required', 'idempotency_key'])));
  const cProduct = getProductPath(slug, claudeRoot); const hProduct = getProductPath(slug, hermesRoot);
  claudeToolkit.pauseToolkit(cProduct, 'parity'); pauseHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity' }); claudeToolkit.resumeToolkit(cProduct, 'parity'); resumeHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity' });
  claudeToolkit.transition(cProduct, 'parity', 'one', 'running'); claudeToolkit.transition(cProduct, 'parity', 'one', 'completed'); const cRepeated = claudeToolkit.transition(cProduct, 'parity', 'one', 'running');
  transitionHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity', task_id: 'one', status: 'running' }); transitionHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity', task_id: 'one', status: 'completed' }); const hRepeated = transitionHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity', task_id: 'one', status: 'running' });
  assert.equal(cRepeated.tasks.find((task) => task.id === 'one').attempts, hRepeated.tasks.find((task) => task.id === 'one').attempts);
  claudeToolkit.transition(cProduct, 'parity', 'two', 'running'); claudeToolkit.transition(cProduct, 'parity', 'two', 'failed', { error: 'fixture' }); assert.throws(() => claudeToolkit.transition(cProduct, 'parity', 'two', 'running'), /explicit retry/); const cRetry = claudeToolkit.transition(cProduct, 'parity', 'two', 'running', { retry: true });
  transitionHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity', task_id: 'two', status: 'running' }); transitionHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity', task_id: 'two', status: 'failed', extra: { error: 'fixture' } }); assert.throws(() => transitionHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity', task_id: 'two', status: 'running' }), /explicit retry/); const hRetry = transitionHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity', task_id: 'two', status: 'running', extra: { retry: true } });
  assert.equal(cRetry.tasks.find((task) => task.id === 'two').attempts, hRetry.tasks.find((task) => task.id === 'two').attempts);
  const cRecheck = claudeToolkit.reevaluateTask(cProduct, 'parity', 'blocked', { action_id: 'create', approval_policy: manual('ads.campaign.create', 'create') }, workflowRegistry); const hRecheck = reevaluateHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'parity', task_id: 'blocked', update: { action_id: 'create', approval_policy: manual('ads.campaign.create', 'create') } });
  assert.equal(cRecheck.tasks.find((task) => task.id === 'blocked').status, hRecheck.tasks.find((task) => task.id === 'blocked').status); mark('toolkit.execute');
  const dependencyTasks = [{ id: 'unknown', workflow_id: 'missing.workflow' }, { id: 'dependent', workflow_id: 'copy.social', depends_on: ['unknown'] }];
  const cDependencies = claudeToolkit.createProductToolkit({ projectRoot: claudeRoot, product_slug: slug, id: 'dependency-chain', tasks: dependencyTasks, registry: workflowRegistry }); const hDependencies = createHermesToolkit({ projectRoot: hermesRoot, product_slug: slug, toolkit_id: 'dependency-chain', tasks: dependencyTasks });
  assert.deepEqual(cDependencies.state.tasks.map((task) => select(task, ['id', 'status', 'reason'])), hDependencies.result.state.tasks.map((task) => select(task, ['id', 'status', 'reason'])));

  for (const platform of ['instagram', 'facebook', 'linkedin', 'tiktok', 'youtube']) {
    const input = { publication_id: `publish-${platform}`, workflow_id: 'social.publish', product: slug, platform, content_type: 'post', artifact_path: 'entregas/conteudo-social/post.md', approval_policy: manual('social.publish', `publish-${platform}`), autopublish: true };
    const claude = claudePublisher.evaluatePublication(claudePublisher.createPublicationRequest(input)); const hermes = evaluateHermesPublication(createHermesPublicationRequest(input)).result;
    assertParity(`publisher ${platform}`, claude, hermes, ['status', 'platform', 'publication_id', 'external_id', 'published_at', 'error', 'dry_run', 'published']); assert.equal(claude.published, false);
  }
  mark('social.publish');
  for (const root of [claudeRoot, hermesRoot]) { const artifact = path.join(getProductPath(slug, root), 'entregas', 'ht'); fs.mkdirSync(artifact, { recursive: true }); fs.writeFileSync(path.join(artifact, 'existente.md'), '# Preservar\n'); }
  const htClaude = claudeHighTicket.getHighTicketStatus({ projectRoot: claudeRoot, product_slug: slug }); const htHermes = getHermesHighTicketStatus({ projectRoot: hermesRoot, product_slug: slug }).result;
  assertParity('High Ticket blocked', htClaude, htHermes, ['status', 'code', 'missing_dependencies', 'existing_artifacts', 'execution']); assert.equal(htClaude.missing_dependencies.length, REQUIRED_HT_COMMANDS.length);

  // Every registry entry has an explicit terminal Hermes decision and every physical wrapper is well formed.
  const matrix = buildHermesParityMatrix(); const distribution = Object.fromEntries(matrix.reduce((counts, entry) => counts.set(entry.hermes_current_support, (counts.get(entry.hermes_current_support) || 0) + 1), new Map()));
  assert.equal(workflowRegistry.list().length, 26); assert.deepEqual(distribution, { HERMES_READY: 12, HERMES_EXTERNAL_DRY_RUN: 12, HERMES_LEGACY: 1, HERMES_BLOCKED_EXTERNAL: 1 });
  for (const entry of matrix) { coverage.get(entry.workflow_id).claude_status = entry.claude_status; coverage.get(entry.workflow_id).hermes_status = entry.hermes_current_support; assert.equal(['HERMES_READY', 'HERMES_EXTERNAL_DRY_RUN', 'HERMES_BLOCKED_EXTERNAL', 'HERMES_LEGACY'].includes(entry.hermes_current_support), true); }
  assert.equal([...coverage.values()].every((entry) => entry.tested_in_e2e), true, `uncovered workflows: ${[...coverage.values()].filter((entry) => !entry.tested_in_e2e).map((entry) => entry.workflow_id).join(', ')}`);
  for (const [workflowId, wrapper] of Object.entries(WRAPPER_PATHS)) { const text = fs.readFileSync(path.join(path.resolve(__dirname, '../..'), wrapper), 'utf8'); assert.match(text, /^---[\s\S]*?version:\s*1\.0\.0/m); assert.match(text, new RegExp(`workflow_id:\\s*${workflowId.replace('.', '\\.')}`)); assert.match(text, /description:/); assert.match(text, /SOURCE-POLICY\.md/); }
  for (const file of ['adapters/claude/meta-ads.js', 'adapters/claude/organic-publisher.js', 'adapters/hermes/meta-workflows.js', 'adapters/hermes/publisher-workflow.js', 'adapters/hermes/orchestration-workflows.js']) assertNoLiveInvoker(file);
  for (const root of ['adapters/claude', 'adapters/hermes']) {
    for (const file of fs.readdirSync(path.join(path.resolve(__dirname, '../..'), root), { recursive: true }).filter((item) => item.endsWith('.js'))) {
      const text = fs.readFileSync(path.join(path.resolve(__dirname, '../..'), root, file), 'utf8');
      const forbidden = root === 'adapters/claude' ? /adapters\/hermes/ : /adapters\/claude/;
      assert.equal(forbidden.test(text), false, `${root}/${file} must converge through core, not import the other runtime`);
    }
  }
  collected.push(lowClaude, middleClaude, pageClaude, carouselClaude, scheduleClaude, researchClaude, researchArtifactClaude, videoClaude, reportClaude, deliveryClaude, planClaude, cRetry, htClaude);
  const serialized = JSON.stringify(collected);
  assert.equal(/op:\/\/|Bearer|Authorization|access_token=|password=|api_key=|EAA[A-Za-z0-9]+|sk-[A-Za-z0-9]+/i.test(serialized), false, 'E2E result leaked a plausible secret');
  assert.deepEqual(counters, { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 });
  assert.equal([deliveryClaude, deliveryHermes].every((delivery) => delivery.sent === false && delivery.dry_run === true), true, 'notification boundary must remain dry-run');
  assert.equal([cDraft, hDraft].every((draft) => draft.status === 'PAUSED' && draft.execution === 'dry_run'), true, 'financial boundary must remain a paused dry-run draft');
} finally {
  restoreGuards();
  fs.rmSync(suiteRoot, { recursive: true, force: true });
}

assert.equal(fs.existsSync(suiteRoot), false);
process.stdout.write('Claude/Hermes E2E parity: ok\n');
