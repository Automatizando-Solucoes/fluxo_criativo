#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const skillsRoot = path.join(root, '.claude', 'skills');
const trafficSkills = fs.readdirSync(skillsRoot)
  .filter((name) => name.startsWith('trafego-'))
  .map((name) => ({
    name,
    text: fs.readFileSync(path.join(skillsRoot, name, 'SKILL.md'), 'utf8'),
  }));

const unsafeRuntime = /(?:access_token\s*=|TOKEN_AQUI|TOKEN_DO_ENV|FB_ACCESS_TOKEN_PERMANENTE|FB_ACCESS_TOKEN_TEMPORARIO|curl\s+.*graph\.facebook\.com)/i;
let legacyCount = 0;
for (const skill of trafficSkills) {
  const legacy = skill.text.includes('LEGACY_META_RUNTIME');
  if (legacy) {
    legacyCount += 1;
    assert.match(skill.text, /user-invocable:\s*false/, `${skill.name} must not be directly invocable`);
    continue;
  }
  assert.equal(unsafeRuntime.test(skill.text), false, `${skill.name} is canonical but contains an unsafe Meta runtime flow`);
}

assert.ok(legacyCount >= 5, 'unsafe historical Meta runtime skills must be explicitly quarantined');
process.stdout.write(`Meta skill secret integrity: ok (${legacyCount} legacy runtime skills quarantined)\n`);
