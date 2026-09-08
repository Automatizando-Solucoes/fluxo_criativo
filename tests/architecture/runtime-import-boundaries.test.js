#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path');
const root = path.resolve(__dirname, '../..');
for (const runtime of ['claude', 'hermes', 'codex']) for (const file of fs.readdirSync(path.join(root, 'adapters', runtime), { recursive: true }).filter((item) => item.endsWith('.js'))) {
  const source = fs.readFileSync(path.join(root, 'adapters', runtime, file), 'utf8');
  for (const other of ['claude', 'hermes', 'codex'].filter((item) => item !== runtime)) assert.equal(new RegExp(`adapters/${other}`).test(source), false, `${runtime}/${file} imports ${other}`);
}
const operationalClaudeReferences = [];
for (const runtime of ['hermes', 'codex']) for (const file of fs.readdirSync(path.join(root, 'adapters', runtime), { recursive: true }).filter((item) => item.endsWith('.js'))) {
  const relative = path.join('adapters', runtime, file); const source = fs.readFileSync(path.join(root, relative), 'utf8');
  if (/\.claude\//.test(source)) operationalClaudeReferences.push(relative);
}
assert.deepEqual(operationalClaudeReferences, ['adapters/hermes/skill-compatibility.js'], 'only catalogued legacy documentation may reference .claude');
const compatibility = fs.readFileSync(path.join(root, 'adapters/hermes/skill-compatibility.js'), 'utf8');
assert.match(compatibility, /estrategista-ht/); assert.match(compatibility, /C10X/);
process.stdout.write('Runtime import boundaries: ok\n');
