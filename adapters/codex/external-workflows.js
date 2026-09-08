'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { immutableCopy } = require('../../core/contracts/immutable');
const { assertProductSlug, getProductPath } = require('../../core/state/product-state');
const { workflowRegistry } = require('../../core/workflows/registry');
const research = require('../../core/external/research');
const image = require('../../core/external/image');
const video = require('../../core/external/video');
const dashboard = require('../../core/external/social-dashboard');

const CODEX_EXTERNAL_WORKFLOWS = Object.freeze(['research.market', 'image.generate', 'creative.static', 'video.generate', 'social.dashboard']);
function assertSupported(workflowId) { if (!CODEX_EXTERNAL_WORKFLOWS.includes(workflowId)) throw new TypeError(`unsupported Codex external workflow: ${workflowId}`); return workflowRegistry.get(workflowId); }
function envelope(workflow, result) { return immutableCopy({ workflow_id: workflow.id, runtime: 'codex', support_status: 'CODEX_EXTERNAL_DRY_RUN', mode: 'dry_run', local_executable: true, external_executable: false, external: true, financial: false, result }); }
function prepareCodexExternalWorkflow(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('external workflow input must be an object');
  const workflow = assertSupported(input.workflow_id);
  switch (workflow.id) {
    case 'research.market': return envelope(workflow, research.prepareSpecializedResearchProvider({ provider: input.provider, secretProvider: input.secretProvider }));
    case 'image.generate': return envelope(workflow, image.prepareImageRequest({ provider: input.provider, prompt: input.prompt, secretProvider: input.secretProvider }));
    case 'video.generate': return envelope(workflow, video.prepareVideoJob({ renderer: input.renderer, script: input.script, secretProvider: input.secretProvider }));
    case 'social.dashboard': return envelope(workflow, dashboard.prepareDashboard({ platform: input.platform, secretProvider: input.secretProvider, provider_error: input.provider_error }));
    case 'creative.static': if (!input.brief || typeof input.brief !== 'string') throw new TypeError('creative brief is required'); return envelope(workflow, { status: 'dry_run', capability: 'image.generate', prompt: input.prompt || input.brief.trim(), external_executable: false });
    default: throw new TypeError(`unsupported Codex external workflow: ${workflow.id}`);
  }
}
function writeCodexMockResult(input) {
  const workflow = assertSupported(input.workflow_id); let result;
  switch (workflow.id) {
    case 'research.market': result = research.createResearchArtifact({ projectRoot: input.projectRoot, input: input.research_input }); break;
    case 'image.generate': result = image.writeMockImageArtifact(input); break;
    case 'video.generate': result = video.writeMockVideoResult(input); break;
    case 'social.dashboard': result = dashboard.writeMockDashboardCache(input); break;
    case 'creative.static': {
      const product = getProductPath(assertProductSlug(input.product_slug), input.projectRoot); const output = path.join(product, 'entregas', 'criativos', `creative-static-${input.slug || 'brief'}.md`);
      if (!input.brief || typeof input.brief !== 'string') throw new TypeError('creative brief is required'); fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, `# Brief criativo\n\n${input.brief.trim()}\n`, 'utf8'); result = immutableCopy({ status: 'success', artifact_path: output, prompt: input.prompt || input.brief.trim(), image_generation: 'not_executed' }); break;
    }
    default: throw new TypeError(`unsupported Codex external workflow: ${workflow.id}`);
  }
  return envelope(workflow, result);
}
function preserveCodexExternalCacheOnFailure(input) {
  assertSupported(input.workflow_id);
  if (input.workflow_id === 'research.market') return research.preserveExistingResearchOnSourceFailure(input);
  if (input.workflow_id === 'social.dashboard') return dashboard.preserveDashboardCacheOnProviderError(input);
  throw new TypeError('cache preservation is not supported for this workflow');
}
module.exports = { CODEX_EXTERNAL_WORKFLOWS, prepareCodexExternalWorkflow, writeCodexMockResult, preserveCodexExternalCacheOnFailure };
