#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { executeHermesLocalWorkflow } = require('../../adapters/hermes/local-workflows');
const { getActiveProduct } = require('../../core/state/product-state');

const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-product-workflow-'));
try {
  const created = executeHermesLocalWorkflow({
    workflow_id: 'product.create', projectRoot: fixture, product_slug: 'produto-hermes',
    name: 'Produto Hermes', type: 'Low Ticket', price: 'R$47',
  });
  const productPath = path.join(fixture, 'meus-produtos', 'produto-hermes');
  assert.equal(created.support_status, 'HERMES_READY');
  assert.equal(created.local_executable, true);
  assert.equal(created.external_executable, false);
  assert.equal(getActiveProduct(fixture), 'produto-hermes');
  assert.equal(fs.existsSync(path.join(productPath, 'entregas', 'copy-pagina')), true);
  assert.match(fs.readFileSync(path.join(fixture, 'meus-produtos', 'index.js'), 'utf8'), /produto-hermes/);
  assert.equal(created.result.product_path.startsWith(`${path.join(fixture, 'meus-produtos')}${path.sep}`), true);

  assert.throws(() => executeHermesLocalWorkflow({
    workflow_id: 'product.create', projectRoot: fixture, product_slug: 'produto-hermes',
    name: 'Duplicado', type: 'Low Ticket', price: 'R$47',
  }), /already exists/);
  assert.throws(() => executeHermesLocalWorkflow({
    workflow_id: 'product.create', projectRoot: fixture, product_slug: '../escape',
    name: 'Inválido', type: 'Low Ticket', price: 'R$47',
  }), /product slug/);
  assert.throws(() => executeHermesLocalWorkflow({
    workflow_id: 'product.create', projectRoot: fixture, product_slug: 'tipo-invalido',
    name: 'Inválido', type: 'High Ticket', price: 'R$47',
  }), /product type/);

  fs.mkdirSync(path.join(fixture, 'meus-produtos', 'produto-alvo'));
  const selected = executeHermesLocalWorkflow({ workflow_id: 'product.select', projectRoot: fixture, product_slug: 'produto-alvo' });
  assert.equal(selected.result.slug, 'produto-alvo');
  assert.equal(getActiveProduct(fixture), 'produto-alvo');
  assert.equal(selected.result.product_path.startsWith(`${path.join(fixture, 'meus-produtos')}${path.sep}`), true);
} finally {
  fs.rmSync(fixture, { recursive: true, force: true });
}

assert.equal(fs.existsSync(fixture), false);
process.stdout.write('Hermes product workflow: ok\n');
