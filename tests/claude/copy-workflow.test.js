#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  COPY_WORKFLOWS,
  REQUIRED_KNOWLEDGE_PATHS,
  getCopyOutputPath,
  reviewCopy,
  saveReviewedCopy,
} = require('../../adapters/claude/copy-workflow');

const root = path.resolve(__dirname, '../..');
for (const requiredPath of REQUIRED_KNOWLEDGE_PATHS) {
  assert.equal(fs.existsSync(path.join(root, requiredPath)), true, `copy knowledge missing: ${requiredPath}`);
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-copy-workflow-'));
try {
  fs.mkdirSync(path.join(fixtureRoot, 'meus-produtos', 'produto-teste'), { recursive: true });
  const pageContent = Array.from({ length: 16 }, (_, index) => `## Bloco ${String(index + 1).padStart(2, '0')}\nTexto específico para o leitor.`).join('\n\n');
  const pageReview = reviewCopy({ workflow_id: 'copy.page', content: pageContent });
  assert.equal(pageReview.status, 'passed');
  assert.equal(pageReview.reviewer, 'revisora');
  assert.throws(() => pageReview.issues.push('changed'), TypeError);
  const saved = saveReviewedCopy({
    projectRoot: fixtureRoot, product_slug: 'produto-teste', workflow_id: 'copy.page', content: pageContent, review: pageReview,
  });
  assert.equal(saved.status, 'saved');
  assert.equal(fs.readFileSync(saved.output_path, 'utf8'), pageContent);

  const blocked = reviewCopy({ workflow_id: 'copy.social', content: 'Não é um texto. É outro texto.' });
  assert.equal(blocked.status, 'blocked');
  assert.ok(blocked.issues.includes('not_x_is_y'));
  assert.throws(() => saveReviewedCopy({
    projectRoot: fixtureRoot, product_slug: 'produto-teste', workflow_id: 'copy.social', content: 'Texto com travessão — proibido.', review: { status: 'passed' },
  }), /common review gate/);
  assert.match(getCopyOutputPath({ projectRoot: fixtureRoot, product_slug: 'produto-teste', workflow_id: 'copy.ad' }), /entregas[\\/]criativos/);
  assert.throws(() => getCopyOutputPath({ projectRoot: fixtureRoot, product_slug: '../escape', workflow_id: 'copy.ad' }), /product slug/);
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

assert.deepEqual(Object.keys(COPY_WORKFLOWS).sort(), ['copy.ad', 'copy.page', 'copy.post_variation', 'copy.script', 'copy.social']);
process.stdout.write('Claude copy workflow: ok\n');
