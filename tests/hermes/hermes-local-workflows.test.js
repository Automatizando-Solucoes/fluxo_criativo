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

const { executeHermesLocalWorkflow } = require('../../adapters/hermes/local-workflows');
const { resolveHermesWorkflow } = require('../../adapters/hermes/resolver');
const claudeProduct = require('../../adapters/claude/product-workflow');
const claudeCopy = require('../../adapters/claude/copy-workflow');
const claudeFunnels = require('../../adapters/claude/low-ticket-workflow');
const localContracts = require('../../core/local/workflows');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-local-workflows-'));
const slug = 'produto-hermes';
const productPath = path.join(fixture, 'meus-produtos', slug);
const counters = { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 };
const originals = {
  fetch: global.fetch,
  httpRequest: http.request, httpGet: http.get, httpsRequest: https.request, httpsGet: https.get, netConnect: net.connect,
  child: Object.fromEntries(['exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'execFileSync', 'fork'].map((name) => [name, childProcess[name]])),
  fs: Object.fromEntries(['writeFileSync', 'appendFileSync', 'renameSync', 'mkdirSync', 'rmSync'].map((name) => [name, fs[name]])),
};
function blockedNetwork() { counters.network_calls += 1; throw new Error('network is forbidden in Hermes local workflows'); }
function blockedChild() { counters.child_process_calls += 1; throw new Error('child process is forbidden in Hermes local workflows'); }
function assertFixtureWrite(target) {
  if (typeof target === 'number') return;
  const resolved = path.resolve(String(target));
  if (resolved !== fixture && !resolved.startsWith(`${fixture}${path.sep}`)) { counters.writes_outside_fixture += 1; throw new Error(`write outside fixture: ${resolved}`); }
}
function installGuards() {
  if (typeof global.fetch === 'function') global.fetch = blockedNetwork;
  http.request = blockedNetwork; http.get = blockedNetwork; https.request = blockedNetwork; https.get = blockedNetwork; net.connect = blockedNetwork;
  for (const name of Object.keys(originals.child)) childProcess[name] = blockedChild;
  fs.writeFileSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.writeFileSync(target, ...args); };
  fs.appendFileSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.appendFileSync(target, ...args); };
  fs.renameSync = (from, to, ...args) => { assertFixtureWrite(from); assertFixtureWrite(to); return originals.fs.renameSync(from, to, ...args); };
  fs.mkdirSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.mkdirSync(target, ...args); };
  fs.rmSync = (target, ...args) => { assertFixtureWrite(target); return originals.fs.rmSync(target, ...args); };
}
function restoreGuards() {
  global.fetch = originals.fetch;
  http.request = originals.httpRequest; http.get = originals.httpGet; https.request = originals.httpsRequest; https.get = originals.httpsGet; net.connect = originals.netConnect;
  for (const [name, value] of Object.entries(originals.child)) childProcess[name] = value;
  for (const [name, value] of Object.entries(originals.fs)) fs[name] = value;
}
function pageCopy() { return Array.from({ length: 16 }, (_, index) => `## Bloco ${String(index + 1).padStart(2, '0')}\nTexto específico validado.`).join('\n\n'); }
function assertProductArtifact(result) { assert.equal(result.result.output_path.startsWith(`${productPath}${path.sep}`), true, `write escaped product: ${result.result.output_path}`); }

assert.equal(claudeProduct.createProduct, localContracts.createProduct, 'product contract must be shared, not copied');
assert.equal(claudeCopy.saveReviewedCopy, localContracts.saveReviewedCopy, 'copy contract must be shared, not copied');
assert.equal(claudeFunnels.createLowTicketPlan, localContracts.createLowTicketPlan, 'funnel contract must be shared, not copied');

installGuards();
try {
  const product = executeHermesLocalWorkflow({ workflow_id: 'product.create', projectRoot: fixture, product_slug: slug, name: 'Produto Hermes', type: 'Low Ticket', price: 'R$47' });
  assert.equal(product.support_status, 'HERMES_READY');
  executeHermesLocalWorkflow({ workflow_id: 'product.select', projectRoot: fixture, product_slug: slug });
  for (const name of ['pesquisa-mercado.md', 'perfil.md', 'idconsumidor.md']) fs.writeFileSync(path.join(productPath, name), '# fixture\n');

  const page = executeHermesLocalWorkflow({ workflow_id: 'copy.page', projectRoot: fixture, product_slug: slug, page_type: 'vendas', content: pageCopy() });
  const ad = executeHermesLocalWorkflow({ workflow_id: 'copy.ad', projectRoot: fixture, product_slug: slug, offer: 'Oferta', content: 'Texto específico validado.' });
  const social = executeHermesLocalWorkflow({ workflow_id: 'copy.social', projectRoot: fixture, product_slug: slug, platform: 'instagram', content: 'Texto específico validado.' });
  const script = executeHermesLocalWorkflow({ workflow_id: 'copy.script', projectRoot: fixture, product_slug: slug, objective: 'vender', content: 'Roteiro específico validado.' });
  for (const result of [page, ad, social, script]) { assert.equal(result.support_status, 'HERMES_READY'); assertProductArtifact(result); }
  assert.equal(social.publication.autopublish, false);

  const low = executeHermesLocalWorkflow({ workflow_id: 'funnel.low_ticket', projectRoot: fixture, product_slug: slug, quiz_required: true });
  const middle = executeHermesLocalWorkflow({ workflow_id: 'funnel.middle_ticket', projectRoot: fixture, product_slug: slug });
  for (const result of [low, middle]) { assert.equal(result.support_status, 'HERMES_EXTERNAL_DRY_RUN'); assert.equal(result.external_executable, false); assertProductArtifact(result); }
  assert.equal(low.result.plan.traffic_handoff.campaign_creation, 'PAUSED');
  assert.equal(middle.result.plan.traffic_handoff.mode, 'dry_run');

  const builtPage = executeHermesLocalWorkflow({ workflow_id: 'page.sales', projectRoot: fixture, product_slug: slug, html: '<html><body><img src="assets/mock.png"></body></html>', copy_review: page.result.review });
  assert.equal(builtPage.support_status, 'HERMES_READY'); assertProductArtifact(builtPage); assert.equal(builtPage.result.deploy.approved, false);
  const carousel = executeHermesLocalWorkflow({ workflow_id: 'carousel.generate', projectRoot: fixture, product_slug: slug, slug: 'lancamento', slides: ['Um', 'Dois'], caption: 'Legenda', cta: 'CTA', visual_prompts: ['Prompt um', 'Prompt dois'] });
  assert.equal(carousel.support_status, 'HERMES_READY'); assertProductArtifact(carousel); assert.equal(carousel.result.artifact.publication.autopublish, false);

  const commercial = executeHermesLocalWorkflow({ workflow_id: 'commercial.playbook', projectRoot: fixture, product_slug: slug });
  const commercialHt = executeHermesLocalWorkflow({ workflow_id: 'commercial.playbook', projectRoot: fixture, product_slug: slug, module: 'COMMERCIAL_HT', existing_artifacts: ['playbook.md'] });
  assert.equal(commercial.result.status, 'READY'); assert.equal(commercialHt.result.status, 'BLOCKED_EXTERNAL'); assert.deepEqual(commercialHt.result.existing_artifacts, ['playbook.md']);

  for (const workflowId of ['product.create', 'product.select', 'copy.page', 'copy.ad', 'copy.social', 'copy.script', 'page.sales', 'carousel.generate', 'commercial.playbook']) {
    const resolution = resolveHermesWorkflow(workflowId); assert.equal(resolution.local_executable, true); assert.equal(resolution.support_status, 'HERMES_READY');
  }
  for (const workflowId of ['funnel.low_ticket', 'funnel.middle_ticket']) {
    const resolution = resolveHermesWorkflow(workflowId); assert.equal(resolution.local_executable, true); assert.equal(resolution.external_executable, false); assert.equal(resolution.support_status, 'HERMES_EXTERNAL_DRY_RUN');
  }
  assert.throws(() => executeHermesLocalWorkflow({ workflow_id: 'unknown.workflow', projectRoot: fixture }), /unknown workflow/);
  assert.equal(counters.network_calls, 0); assert.equal(counters.child_process_calls, 0); assert.equal(counters.writes_outside_fixture, 0);
} finally {
  restoreGuards();
  fs.rmSync(fixture, { recursive: true, force: true });
}

assert.equal(fs.existsSync(fixture), false);
process.stdout.write('Hermes local workflow parity: ok\n');
