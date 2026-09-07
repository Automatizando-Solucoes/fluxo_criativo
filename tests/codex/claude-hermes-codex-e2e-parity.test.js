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
const { createProduct } = require('../../core/local/workflows');
const { workflowRegistry } = require('../../core/workflows/registry');
const { buildHermesParityMatrix } = require('../../adapters/hermes/parity');
const { buildCodexParityMatrix } = require('../../adapters/codex/parity');
const { createCodexLocal } = require('../../adapters/codex/workflows');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'three-runtime-'));
const counters = { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 };
const originals = {
  fetch: global.fetch, httpRequest: http.request, httpGet: http.get, httpsRequest: https.request, httpsGet: https.get, netConnect: net.connect,
  child: Object.fromEntries(['exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'execFileSync', 'fork'].map((name) => [name, childProcess[name]])),
  fs: Object.fromEntries(['writeFileSync', 'appendFileSync', 'renameSync', 'mkdirSync', 'rmSync'].map((name) => [name, fs[name]])),
};
function blockNetwork() { counters.network_calls += 1; throw new Error('network forbidden in three-runtime parity'); }
function blockChild() { counters.child_process_calls += 1; throw new Error('child process forbidden in three-runtime parity'); }
function assertFixtureWrite(target) { if (typeof target === 'number') return; const value = path.resolve(String(target)); if (value !== root && !value.startsWith(`${root}${path.sep}`)) { counters.writes_outside_fixture += 1; throw new Error(`write outside fixture: ${value}`); } }
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

try {
  installGuards();
  const input = { slug: 'produto-paridade', name: 'Produto Paridade', type: 'Low Ticket', price: 'R$47' };
  const claude = createProduct({ projectRoot: path.join(root, 'claude'), ...input });
  const hermes = createProduct({ projectRoot: path.join(root, 'hermes'), ...input });
  const codex = createCodexLocal({ workflow_id: 'product.create', projectRoot: path.join(root, 'codex'), product_slug: input.slug, name: input.name, type: input.type, price: input.price }).result;
  assert.deepEqual({ slug: claude.slug, active: claude.manifest.ativo }, { slug: hermes.slug, active: hermes.manifest.ativo });
  assert.deepEqual({ slug: claude.slug, active: claude.manifest.ativo }, { slug: codex.slug, active: codex.manifest.ativo });

  const hermesMatrix = new Map(buildHermesParityMatrix().map((item) => [item.workflow_id, item]));
  const codexMatrix = new Map(buildCodexParityMatrix().map((item) => [item.workflow_id, item]));
  for (const workflow of workflowRegistry.list()) {
    const hermesEntry = hermesMatrix.get(workflow.id); const codexEntry = codexMatrix.get(workflow.id);
    assert.ok(hermesEntry, `Hermes decision missing: ${workflow.id}`); assert.ok(codexEntry, `Codex decision missing: ${workflow.id}`);
    assert.equal(hermesEntry.external, workflow.side_effects.external); assert.equal(codexEntry.external, workflow.side_effects.external);
    assert.equal(hermesEntry.financial, workflow.side_effects.financial); assert.equal(codexEntry.financial, workflow.side_effects.financial);
    assert.equal(hermesEntry.approval_required, workflow.approval.required); assert.equal(codexEntry.approval_required, workflow.approval.required);
  }
  assert.deepEqual(counters, { network_calls: 0, child_process_calls: 0, writes_outside_fixture: 0 });
} finally {
  restoreGuards(); fs.rmSync(root, { recursive: true, force: true });
}
assert.equal(fs.existsSync(root), false);
process.stdout.write('Claude/Hermes/Codex E2E parity: ok\n');
