#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { REQUIRED_HT_COMMANDS, getHighTicketStatus } = require('../../adapters/claude/high-ticket-status');

const root = path.resolve(__dirname, '../..');
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-high-ticket-'));
try {
  const productPath = path.join(fixtureRoot, 'meus-produtos', 'produto-ht', 'entregas', 'ht');
  fs.mkdirSync(productPath, { recursive: true });
  fs.writeFileSync(path.join(productPath, 'contexto-existente.md'), '# Contexto\n', 'utf8');
  const status = getHighTicketStatus({ projectRoot: fixtureRoot, product_slug: 'produto-ht' });
  assert.equal(status.status, 'BLOCKED_EXTERNAL');
  assert.equal(status.code, 'c10x_skills_unavailable');
  assert.deepEqual(status.existing_artifacts, ['contexto-existente.md']);
  assert.equal(fs.existsSync(path.join(productPath, 'contexto-existente.md')), true);
  assert.equal(status.missing_dependencies.length, REQUIRED_HT_COMMANDS.length);
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

for (const command of REQUIRED_HT_COMMANDS) {
  assert.equal(fs.existsSync(path.join(root, '.claude', 'commands', `${command}.md`)), false, `${command} unexpectedly available`);
}
assert.equal(fs.existsSync(path.join(root, '.claude', 'agents', 'estrategista-ht.md')), true);
process.stdout.write('Claude High Ticket external block: ok\n');
