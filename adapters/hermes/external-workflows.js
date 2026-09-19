'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { immutableCopy } = require('../../core/contracts/immutable');
const { assertProjectRoot, assertProductSlug, getProductPath } = require('../../core/state/product-state');
const { workflowRegistry } = require('../../core/workflows/registry');
const research = require('../../core/external/research');
const image = require('../../core/external/image');
const video = require('../../core/external/video');
const dashboard = require('../../core/external/social-dashboard');
const geminiLive = require('./gemini-image-live');

const EXTERNAL_DRY_RUN_WORKFLOWS = Object.freeze(['research.market', 'image.generate', 'creative.static', 'video.generate', 'social.dashboard']);

function assertExternalWorkflow(workflowId) {
  if (!EXTERNAL_DRY_RUN_WORKFLOWS.includes(workflowId)) throw new TypeError(`Hermes external workflow is not supported: ${workflowId}`);
  return workflowRegistry.get(workflowId);
}
function base(workflow, result) {
  return immutableCopy({ workflow_id: workflow.id, runtime: 'hermes', support_status: 'HERMES_EXTERNAL_DRY_RUN', mode: 'dry_run', local_executable: true, external_executable: false, external: true, financial: false, result });
}
function prepareHermesExternalWorkflow(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('external workflow input must be an object');
  const workflow = assertExternalWorkflow(input.workflow_id);
  switch (workflow.id) {
    case 'research.market': return base(workflow, research.prepareSpecializedResearchProvider({ provider: input.provider, secretProvider: input.secretProvider }));
    case 'image.generate': return base(workflow, image.prepareImageRequest({ provider: input.provider, prompt: input.prompt, secretProvider: input.secretProvider }));
    case 'video.generate': return base(workflow, video.prepareVideoJob({ renderer: input.renderer, script: input.script, secretProvider: input.secretProvider }));
    case 'social.dashboard': return base(workflow, dashboard.prepareDashboard({ platform: input.platform, secretProvider: input.secretProvider, provider_error: input.provider_error }));
    case 'creative.static': {
      if (typeof input.brief !== 'string' || input.brief.trim().length === 0) throw new TypeError('creative brief is required');
      return base(workflow, { status: 'dry_run', capability: 'image.generate', prompt: input.prompt || input.brief.trim(), external_executable: false });
    }
    default: throw new TypeError(`Hermes external workflow is not supported: ${workflow.id}`);
  }
}
function writeHermesMockResult(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('mock result input must be an object');
  const workflow = assertExternalWorkflow(input.workflow_id); const projectRoot = assertProjectRoot(input.projectRoot);
  let result;
  switch (workflow.id) {
    case 'research.market': result = research.createResearchArtifact({ projectRoot, input: input.research_input }); break;
    case 'image.generate': result = image.writeMockImageArtifact({ projectRoot, product_slug: input.product_slug, provider: input.provider, request_id: input.request_id, status: input.status }); break;
    case 'video.generate': result = video.writeMockVideoResult({ projectRoot, product_slug: input.product_slug, renderer: input.renderer, job_id: input.job_id, status: input.status }); break;
    case 'social.dashboard': result = dashboard.writeMockDashboardCache({ projectRoot, product_slug: input.product_slug, platform: input.platform, metrics: input.metrics }); break;
    case 'creative.static': {
      const slug = assertProductSlug(input.product_slug); if (typeof input.brief !== 'string' || input.brief.trim().length === 0) throw new TypeError('creative brief is required');
      const outputPath = path.join(getProductPath(slug, projectRoot), 'entregas', 'criativos', `creative-static-${input.slug || 'brief'}.md`);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true }); fs.writeFileSync(outputPath, `# Brief criativo\n\n${input.brief.trim()}\n`, 'utf8');
      result = immutableCopy({ status: 'success', artifact_path: outputPath, prompt: input.prompt || input.brief.trim(), image_generation: 'not_executed' });
      break;
    }
    default: throw new TypeError(`Hermes external workflow is not supported: ${workflow.id}`);
  }
  return base(workflow, result);
}
function preserveHermesExternalCacheOnFailure({ workflow_id, projectRoot, product_slug, platform, reason }) {
  assertExternalWorkflow(workflow_id);
  if (workflow_id === 'research.market') return research.preserveExistingResearchOnSourceFailure({ projectRoot, product_slug, reason });
  if (workflow_id === 'social.dashboard') return dashboard.preserveDashboardCacheOnProviderError({ projectRoot, product_slug, platform });
  throw new TypeError('cache preservation is not supported for this workflow');
}

function executeApprovedGeminiImage(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('approved image input must be an object');
  const workflow = assertExternalWorkflow(input.workflow_id);
  if (!['image.generate', 'creative.static'].includes(workflow.id)) throw new TypeError('approved Gemini execution is not supported for this workflow');
  const prompt = typeof input.prompt === 'string' && input.prompt.trim() ? input.prompt : input.brief;
  const result = geminiLive.executeGeminiImage({ projectRoot: assertProjectRoot(input.projectRoot), product_slug: input.product_slug, slug: input.slug || 'criativo', prompt, aspect_ratio: input.aspect_ratio, resolution: input.resolution, workflow_id: workflow.id, action_id: input.action_id, approval_policy: input.approval_policy, now: input.now, usage: input.usage });
  return immutableCopy({ workflow_id: workflow.id, runtime: 'hermes', support_status: result.status === 'generated' ? 'HERMES_READY_EXTERNAL' : 'HERMES_EXTERNAL_GATED', mode: result.status === 'generated' ? 'approved_execution' : 'blocked', local_executable: true, external_executable: result.status === 'generated', external: true, financial: true, result });
}

module.exports = { EXTERNAL_DRY_RUN_WORKFLOWS, prepareHermesExternalWorkflow, writeHermesMockResult, preserveHermesExternalCacheOnFailure, executeApprovedGeminiImage };
