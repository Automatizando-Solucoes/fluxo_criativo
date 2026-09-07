#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { MockSecretProvider } = require('../../core/secrets/provider');
const {
  RESEARCH_AXES,
  createResearchArtifact,
  prepareSpecializedResearchProvider,
  preserveExistingResearchOnSourceFailure,
} = require('../../adapters/claude/market-research');

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-market-research-'));
try {
  const productPath = path.join(fixtureRoot, 'meus-produtos', 'produto-teste');
  fs.mkdirSync(productPath, { recursive: true });
  const axes = RESEARCH_AXES.map((name, index) => ({
    findings: [{
      kind: index % 2 === 0 ? 'fact' : 'inference',
      statement: `Achado verificável para ${name}`,
      source: `https://example.test/source-${index + 1}`,
    }],
  }));
  const result = createResearchArtifact({
    projectRoot: fixtureRoot,
    input: {
      product_slug: 'produto-teste', niche: 'nicho de teste', quadro: 'transformação de teste',
      intended_format: 'curso', researched_at: '2026-09-06', axes,
    },
  });
  const artifact = fs.readFileSync(result.artifact_path, 'utf8');
  assert.equal(result.status, 'ready');
  assert.equal(result.review.agent, 'revisor-pesquisa');
  assert.match(artifact, /Data da pesquisa:\*\* 2026-09-06/);
  assert.match(artifact, /\*\*FATO:\*\*/);
  assert.match(artifact, /\*\*INFERÊNCIA:\*\*/);
  assert.equal((artifact.match(/^## \d+\./gm) || []).length, 9);
  assert.throws(() => createResearchArtifact({
    projectRoot: fixtureRoot,
    input: { product_slug: 'produto-teste', niche: 'n', quadro: 'q', intended_format: 'f', researched_at: '2026-09-06', axes: axes.slice(0, 8) },
  }), /requires all 9 axes/);

  const provider = new MockSecretProvider({ APIFY_API_TOKEN: 'op://fixture/apify/token' });
  const prepared = prepareSpecializedResearchProvider({ provider: 'apify', secretProvider: provider });
  assert.equal(prepared.status, 'dry_run');
  assert.equal(prepared.injection.injected, false);
  assert.equal(typeof provider.get_secret, 'undefined');
  assert.equal(prepareSpecializedResearchProvider({ provider: 'ads_library', secretProvider: provider }).status, 'unavailable');

  const beforeFailure = fs.readFileSync(result.artifact_path, 'utf8');
  const failure = preserveExistingResearchOnSourceFailure({
    projectRoot: fixtureRoot, product_slug: 'produto-teste', reason: 'provider_timeout',
  });
  assert.equal(failure.preserved_existing_artifact, true);
  assert.equal(fs.readFileSync(result.artifact_path, 'utf8'), beforeFailure);
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

process.stdout.write('Claude market research workflow: ok\n');
