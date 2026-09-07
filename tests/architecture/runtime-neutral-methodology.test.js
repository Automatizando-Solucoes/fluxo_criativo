#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const { buildHermesParityMatrix } = require('../../adapters/hermes/parity'); const { buildCodexParityMatrix } = require('../../adapters/codex/parity');
for (const entry of [...buildHermesParityMatrix(), ...buildCodexParityMatrix()]) { assert.match(entry.methodology_source, /^agents\//, `${entry.workflow_id} must use neutral methodology`); assert.equal(fs.existsSync(path.join(root, entry.methodology_source)), true); }
for (const file of fs.readdirSync(path.join(root, 'agents', 'skills'), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => path.join(root, 'agents', 'skills', entry.name, 'SKILL.md'))) {
  const text = fs.readFileSync(file, 'utf8'); assert.equal(/Skill\(|Agent\(|Task\(|\bcurl\b|fetch\(|op read|op run|graph\.facebook\.com/.test(text), false, `unsafe runtime instruction in ${file}`);
}
for (const file of ['security.md', 'approvals.md', 'secrets.md', 'source-policy.md']) assert.equal(fs.existsSync(path.join(root, 'agents/policies', file)), true);
process.stdout.write('Runtime-neutral methodology: ok\n');
