#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const skillsRoot = path.join(root, '.claude', 'skills');
const commandsRoot = path.join(root, '.claude', 'commands');
const canonicalTrafficSkills = [
  'trafego-insights',
  'trafego-analise',
  'trafego-criar-campanha',
  'trafego-otimizar',
  'trafego-escalar',
];

const unsafeRuntime = /(?:access_token\s*=|TOKEN_AQUI|TOKEN_DO_ENV|FB_ACCESS_TOKEN_PERMANENTE|FB_ACCESS_TOKEN_TEMPORARIO|curl\s+.*graph\.facebook\.com)/i;
for (const name of canonicalTrafficSkills) {
  const text = fs.readFileSync(path.join(skillsRoot, name, 'SKILL.md'), 'utf8');
  assert.match(text, /CANONICAL_SAFE_META_METHODOLOGY/, `${name} must expose canonical methodology`);
  assert.match(text, /user-invocable:\s*false/, `${name} must not be directly invocable`);
  assert.equal(unsafeRuntime.test(text), false, `${name} contains an unsafe Meta runtime flow`);

  const command = fs.readFileSync(path.join(commandsRoot, `${name}.md`), 'utf8');
  assert.match(command, new RegExp(`\\.claude/skills/${name}/SKILL\\.md`), `${name} command must reference its canonical methodology`);
}

process.stdout.write('Meta skill secret integrity: ok (5 canonical methodology skills, 0 unsafe Meta runtime flows)\n');
