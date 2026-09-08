#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const { METHODOLOGY_MANIFEST } = require('../../agents/METHODOLOGY-MANIFEST');
const { buildHermesParityMatrix } = require('../../adapters/hermes/parity');
const { buildCodexParityMatrix } = require('../../adapters/codex/parity');

function markdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(target) : entry.name.endsWith('.md') ? [target] : [];
  });
}
function isProhibition(line) { return /\b(nunca|não|nao|proibid|ignorar|substituir|evite)\b/i.test(line); }
function assertNoOperationalAuthority(file) {
  for (const [index, line] of fs.readFileSync(file, 'utf8').split(/\r?\n/).entries()) {
    const forbidden = /Skill\(|Agent\(|Task\(|\bcurl\b|fetch\(|\bop (?:read|run)\b|graph\.facebook\.com|Authorization:|access_token=/i.test(line);
    assert.equal(forbidden && !isProhibition(line), false, `operational runtime authority in ${path.relative(root, file)}:${index + 1}`);
  }
}

assert.ok(METHODOLOGY_MANIFEST.length >= 9, 'methodology manifest must cover migrated domains');
for (const entry of METHODOLOGY_MANIFEST) {
  const canonical = path.join(root, entry.canonical_path);
  assert.equal(fs.existsSync(canonical), true, `canonical source missing: ${entry.id}`);
  assert.equal(fs.existsSync(path.join(root, entry.legacy_source)), true, `legacy inventory missing: ${entry.id}`);
  const text = fs.readFileSync(canonical, 'utf8');
  for (const section of entry.required_sections) assert.match(text, new RegExp(`^## ${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'), `${entry.id} lacks ${section}`);
  for (const concept of entry.required_concepts || []) assert.match(text, concept, `${entry.id} lacks required methodology concept ${concept}`);
  assert.equal(/\.claude\/.*(?:legacy-runtime|LEGACY-METHODOLOGY)/.test(text), false, `${entry.id} must not depend on legacy methodology`);
}
for (const entry of [...buildHermesParityMatrix(), ...buildCodexParityMatrix()]) {
  assert.match(entry.methodology_source, /^agents\//, `${entry.workflow_id} must use neutral methodology`);
  assert.equal(fs.existsSync(path.join(root, entry.methodology_source)), true);
}
for (const file of markdownFiles(path.join(root, 'agents'))) assertNoOperationalAuthority(file);
for (const file of ['security.md', 'approvals.md', 'secrets.md', 'source-policy.md']) assert.equal(fs.existsSync(path.join(root, 'agents/policies', file)), true);
process.stdout.write('Runtime-neutral methodology: ok\n');
