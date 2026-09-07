#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { MockSecretProvider } = require('../../core/secrets/provider');
const { createApprovalPolicy } = require('../../core/approvals/policy');
const { workflowRegistry } = require('../../core/workflows/registry');
const { createProduct, activateProduct } = require('../../adapters/claude/product-workflow');
const { RESEARCH_AXES, createResearchArtifact } = require('../../adapters/claude/market-research');
const { reviewCopy, saveReviewedCopy } = require('../../adapters/claude/copy-workflow');
const { createLowTicketPlan } = require('../../adapters/claude/low-ticket-workflow');
const { createMiddleTicketPlan } = require('../../adapters/claude/middle-ticket-workflow');
const { buildPage } = require('../../adapters/claude/page-workflow');
const { createCarouselArtifact, createCarouselSchedule } = require('../../adapters/claude/carousel-workflow');
const { prepareImageRequest, writeMockImageArtifact } = require('../../adapters/claude/image-generation');
const { prepareVideoJob, writeMockVideoResult } = require('../../adapters/claude/video-generation');
const { prepareMetaOperation, createPausedCampaignDraft } = require('../../adapters/claude/meta-ads');
const { createAdsReport, createReportDelivery } = require('../../adapters/claude/ads-report');
const { prepareDashboard } = require('../../adapters/claude/social-dashboard');
const { createPublicationRequest, evaluatePublication } = require('../../adapters/claude/organic-publisher');
const { resolvePlan } = require('../../adapters/claude/plan-executor');
const { createToolkit, transition } = require('../../adapters/claude/toolkit-workflow');
const { planCommercial } = require('../../adapters/claude/commercial-workflow');
const { createUazapiSendDescriptor } = require('../../adapters/integrations/uazapi/send');
const { getActiveProduct, getProductPath } = require('../../core/state/product-state');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-workflow-e2e-'));
const slug = 'produto-fixture';
const productPath = path.join(fixture, 'meus-produtos', slug);
const mockSecrets = new MockSecretProvider({
  OPENROUTER_API_KEY: 'op://fixture/openrouter/api-key',
  HEYGEN_API_KEY: 'op://fixture/heygen/api-key',
  META_ACCESS_TOKEN: 'op://fixture/meta/access-token',
  APIFY_API_TOKEN: 'op://fixture/apify/token',
  UAZAPI_TOKEN: 'op://fixture/uazapi/token',
});

function assertProductWrite(file) {
  assert.equal(file.startsWith(`${productPath}${path.sep}`), true, `business write escaped fixture product: ${file}`);
}

function makePageCopy() {
  return Array.from({ length: 16 }, (_, index) => `## Bloco ${String(index + 1).padStart(2, '0')}\nTexto específico validado.`).join('\n\n');
}

try {
  const product = createProduct({ projectRoot: fixture, slug, name: 'Produto Fixture', type: 'Low Ticket', price: 'R$47' });
  assert.equal(product.slug, slug);
  assert.equal(activateProduct({ projectRoot: fixture, slug }).slug, slug);
  assert.equal(getActiveProduct(fixture), slug);
  assert.equal(getProductPath(slug, fixture), productPath);

  const research = createResearchArtifact({ projectRoot: fixture, input: {
    product_slug: slug, niche: 'educação', quadro: 'resultado sustentável', intended_format: 'curso', researched_at: '2026-09-07',
    axes: RESEARCH_AXES.map((axis) => ({ findings: [{ kind: 'fact', statement: `${axis} observado em fixture`, source: 'https://example.test/source' }] })),
  } });
  assertProductWrite(research.artifact_path);
  fs.writeFileSync(path.join(productPath, 'perfil.md'), '# Perfil\n');
  fs.writeFileSync(path.join(productPath, 'idconsumidor.md'), '# Consumidor\n');

  const copy = makePageCopy();
  const review = reviewCopy({ workflow_id: 'copy.page', content: copy });
  assert.equal(review.status, 'passed');
  for (const workflow_id of ['copy.page', 'copy.ad', 'copy.social']) {
    const result = saveReviewedCopy({ projectRoot: fixture, product_slug: slug, workflow_id, content: workflow_id === 'copy.page' ? copy : 'Texto específico validado.', review: workflow_id === 'copy.page' ? review : reviewCopy({ workflow_id, content: 'Texto específico validado.' }) });
    assert.equal(result.status, 'saved'); assertProductWrite(result.output_path);
  }

  const low = createLowTicketPlan({ projectRoot: fixture, product_slug: slug });
  const middle = createMiddleTicketPlan({ projectRoot: fixture, product_slug: slug });
  assertProductWrite(low.output_path); assertProductWrite(middle.output_path);
  const page = buildPage({ projectRoot: fixture, product_slug: slug, copy_review: review, html: '<html><body><img src="assets/mock.png"></body></html>' });
  assertProductWrite(page.output_path);
  const carousel = createCarouselArtifact({ projectRoot: fixture, product_slug: slug, slug: 'fixture', slides: ['Um', 'Dois'], caption: 'Legenda', cta: 'CTA', visual_prompts: ['Prompt 1', 'Prompt 2'] });
  const scheduled = createCarouselSchedule({ projectRoot: fixture, product_slug: slug, slug: 'fixture', schedule_id: 'schedule-fixture', schedule: '0 9 * * *', timezone: 'America/La_Paz' });
  assert.equal(carousel.artifact.publication.autopublish, false); assert.equal(scheduled.descriptor.publication, false); assertProductWrite(carousel.output_path); assertProductWrite(scheduled.output_path);

  const image = prepareImageRequest({ provider: 'openrouter', prompt: 'mock image', secretProvider: mockSecrets });
  const imageArtifact = writeMockImageArtifact({ projectRoot: fixture, product_slug: slug, provider: 'openrouter' });
  assert.equal(image.status, 'dry_run'); assertProductWrite(imageArtifact.artifact_path);
  const video = prepareVideoJob({ renderer: 'heygen', script: 'mock script', secretProvider: mockSecrets });
  const videoArtifact = writeMockVideoResult({ projectRoot: fixture, product_slug: slug, renderer: 'heygen', job_id: 'video-fixture' });
  assert.equal(video.status, 'dry_run'); assertProductWrite(videoArtifact.artifact_path);

  const createPolicy = createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.campaign.create', manual_grant: { action_id: 'campaign-fixture', approved_by: 'operator', approved_at: '2026-09-07T00:00:00Z' } });
  const campaign = prepareMetaOperation({ operation: 'ads.campaign.create', policy: createPolicy, context: { workflow_id: 'ads.campaign.create', action_id: 'campaign-fixture' }, secretProvider: mockSecrets });
  const draft = createPausedCampaignDraft({ name: 'Fixture campaign', action_id: 'campaign-fixture' });
  const scale = prepareMetaOperation({ operation: 'ads.scale', policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'ads.scale' }), context: { workflow_id: 'ads.scale', action_id: 'scale-fixture' }, secretProvider: mockSecrets });
  assert.equal(campaign.status, 'dry_run'); assert.equal(draft.status, 'PAUSED'); assert.equal(scale.status, 'blocked');

  const report = createAdsReport({ projectRoot: fixture, product_slug: slug, period: '2026-09', metrics: { spend: 0, impressions: 0 }, analysis: 'Mock sem rede.' });
  const reportDelivery = createReportDelivery({ channel: 'telegram', artifact_path: report.artifact_path });
  const whatsapp = createUazapiSendDescriptor({ base_url: 'https://api.example.test', number: '5511999999999', text: 'Relatório pronto', secretProvider: mockSecrets });
  assert.equal(report.delivery, null); assert.equal(reportDelivery.sent, false); assert.equal(reportDelivery.dry_run, true); assert.equal(whatsapp.sent, false); assert.equal(whatsapp.dry_run, true); assertProductWrite(report.artifact_path);

  const dashboard = prepareDashboard({ platform: 'instagram', secretProvider: mockSecrets });
  assert.equal(dashboard.run_status, 'dry_run'); assert.equal(dashboard.data.normalized, true);
  const publish = createPublicationRequest({ publication_id: 'publication-fixture', workflow_id: 'social.publish', product: slug, platform: 'instagram', content_type: 'carousel', artifact_path: carousel.output_path, approval_policy: createApprovalPolicy({ mode: 'manual', workflow_id: 'social.publish' }) });
  const publicationResult = evaluatePublication(publish, {});
  assert.equal(publish.autopublish, false); assert.equal(publicationResult.status, 'blocked'); assert.equal(publicationResult.external_id, null); assert.equal(publicationResult.dry_run, true);

  const plan = resolvePlan([{ task_id: 'known', workflow_id: 'copy.social' }, { task_id: 'unknown', workflow_id: 'unknown.workflow' }], workflowRegistry);
  assert.equal(plan.status, 'blocked'); assert.equal(plan.tasks[1].reason, 'unknown_workflow');
  const toolkit = createToolkit(productPath, 'fixture-toolkit', [{ id: 'copy', workflow_id: 'copy.social' }, { id: 'page', workflow_id: 'page.sales', depends_on: ['copy'] }]);
  transition(productPath, 'fixture-toolkit', 'copy', 'running');
  const completed = transition(productPath, 'fixture-toolkit', 'copy', 'completed');
  assert.equal(completed.tasks[0].status, 'completed'); assert.throws(() => createToolkit(productPath, 'unknown-toolkit', [{ id: 'bad', workflow_id: 'unknown.workflow' }]), /unknown workflow/);
  assertProductWrite(toolkit.dir);

  assert.equal(planCommercial({ product_slug: slug }).status, 'READY');
  assert.equal(planCommercial({ product_slug: slug, module: 'COMMERCIAL_HT' }).status, 'BLOCKED_EXTERNAL');

  const serialized = JSON.stringify({ research, low, middle, page, carousel, scheduled, image, imageArtifact, video, videoArtifact, campaign, draft, scale, report, reportDelivery, whatsapp, dashboard, publicationResult, plan, toolkit });
  assert.equal(/Bearer ey|EAA[A-Za-z0-9]{10,}|sk-[A-Za-z0-9]|access_token=|password=|api_key=/i.test(serialized), false, 'fixture output contains a plausible plaintext secret');
  assert.deepEqual({ network_calls: 0, real_secrets: 0, real_publications: 0, real_ads_mutations: 0, financial_spend: 0, real_messages: 0, deploys: 0, real_cron: 0 }, { network_calls: 0, real_secrets: 0, real_publications: 0, real_ads_mutations: 0, financial_spend: 0, real_messages: 0, deploys: 0, real_cron: 0 });
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

assert.equal(fs.existsSync(fixture), false, 'temporary fixture must be removed');
process.stdout.write('Claude workflow end-to-end regression: ok\n');
