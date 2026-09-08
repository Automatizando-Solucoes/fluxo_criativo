#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const skillsRoot = path.join(root, 'agents', 'skills');
const commandsRoot = path.join(root, '.claude', 'commands');
const canonicalTrafficSkills = [
  'trafego-insights',
  'trafego-analise',
  'trafego-criar-campanha',
  'trafego-otimizar',
  'trafego-escalar',
];

const unsafeRuntime = /(?:access_token\s*=|TOKEN_AQUI|TOKEN_DO_ENV|FB_ACCESS_TOKEN_PERMANENTE|FB_ACCESS_TOKEN_TEMPORARIO|curl\s+.*graph\.facebook\.com)/i;
const directProviderRuntime = /(?:graph\.facebook\.com|\b(?:GET|POST|PATCH|DELETE)\s+\/)/i;
const legacyAccountAliases = /\b(?:FB_AD_ACCOUNT_ID|FB_AD_ACCOUNT_IDS|AD_ACCOUNT_ID)\b/i;
for (const name of canonicalTrafficSkills) {
  const text = fs.readFileSync(path.join(skillsRoot, name, 'SKILL.md'), 'utf8');
  assert.match(text, /Boundary canônico/, `${name} must expose the canonical boundary`);
  assert.equal(unsafeRuntime.test(text), false, `${name} contains an unsafe Meta runtime flow`);
  assert.equal(directProviderRuntime.test(text), false, `${name} contains a direct Meta provider instruction`);
  assert.equal(legacyAccountAliases.test(text), false, `${name} contains a legacy Meta account config alias`);

  const command = fs.readFileSync(path.join(commandsRoot, `${name}.md`), 'utf8');
  assert.match(command, new RegExp(`agents/skills/${name}/SKILL\\.md`), `${name} command must reference its canonical methodology`);
}

process.stdout.write('Meta skill secret integrity: ok (5 canonical methodology skills, 0 unsafe secret flows, 0 direct provider runtime flows, 0 legacy account aliases)\n');
