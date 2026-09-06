#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const {
  DELIVERY_DIRECTORIES,
  activateProduct,
  createProduct,
  listProducts,
} = require('../../adapters/claude/product-workflow');
const { getActiveProduct } = require('../../core/state/product-state');

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-product-workflow-'));
try {
  const created = createProduct({
    projectRoot: fixtureRoot,
    slug: 'curso-teste',
    name: 'Curso de Teste',
    type: 'Low Ticket',
    price: 'R$47',
  });
  const productPath = path.join(fixtureRoot, 'meus-produtos', 'curso-teste');
  assert.equal(created.slug, 'curso-teste');
  assert.equal(getActiveProduct(fixtureRoot), 'curso-teste');
  assert.equal(fs.readFileSync(path.join(productPath, 'tipo.md'), 'utf8'), 'Low Ticket\n');
  assert.equal(fs.readFileSync(path.join(productPath, 'preco.md'), 'utf8'), 'R$47\n');
  for (const directory of DELIVERY_DIRECTORIES) {
    assert.equal(fs.statSync(path.join(productPath, directory)).isDirectory(), true, directory);
  }
  assert.match(fs.readFileSync(path.join(fixtureRoot, 'meus-produtos', 'index.js'), 'utf8'), /curso-teste/);

  assert.throws(() => createProduct({
    projectRoot: fixtureRoot, slug: 'curso-teste', name: 'Outro', type: 'Low Ticket', price: 'R$47',
  }), /already exists/);
  assert.throws(() => createProduct({
    projectRoot: fixtureRoot, slug: '../outside', name: 'Inválido', type: 'Low Ticket', price: 'R$47',
  }), /product slug/);
  assert.throws(() => createProduct({
    projectRoot: fixtureRoot, slug: 'tipo-invalido', name: 'Inválido', type: 'High Ticket', price: 'R$47',
  }), /product type/);

  fs.mkdirSync(path.join(fixtureRoot, 'meus-produtos', 'mentoria-teste'));
  const activated = activateProduct({ projectRoot: fixtureRoot, slug: 'mentoria-teste' });
  assert.equal(activated.slug, 'mentoria-teste');
  assert.equal(getActiveProduct(fixtureRoot), 'mentoria-teste');
  assert.deepEqual(listProducts(fixtureRoot).map((product) => product.slug), ['curso-teste', 'mentoria-teste']);
  assert.throws(() => activateProduct({ projectRoot: fixtureRoot, slug: 'nao-existe' }), /does not exist/);
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

for (const requiredPath of [
  '.claude/agents/revisor-pesquisa.md',
  '.claude/agents/revisor-perfil.md',
  '.claude/agents/revisor-idconsumidor.md',
  '.claude/skills/vtsd-completo/SKILL.md',
]) {
  assert.equal(fs.existsSync(path.join(root, requiredPath)), true, `required VTSD compatibility asset missing: ${requiredPath}`);
}

process.stdout.write('Claude product and VTSD workflow: ok\n');
