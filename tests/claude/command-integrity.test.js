#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const commandRoot = path.join(root, '.claude', 'commands');
const results = { VALID: [], LEGACY: [], BLOCKED_EXTERNAL: [], MISSING: [] };

function filesRecursively(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? filesRecursively(target) : [target];
  });
}

function classify(source, target) {
  const normalized = target.replaceAll('\\', '/');
  if (/\bht-[a-z0-9-]*/i.test(normalized)) {
    results.BLOCKED_EXTERNAL.push({ source, target: normalized });
    return;
  }
  if (!normalized.startsWith('.claude/') && !normalized.startsWith('scripts/') && !normalized.startsWith('painel/') && !normalized.startsWith('assets/')) {
    return;
  }
  if (/[{}]|\.\.\.|(?:^|\/)\.tmp-/.test(normalized) || normalized.startsWith('assets/')) {
    results.LEGACY.push({ source, target: normalized, reason: 'template_or_product_artifact' });
    return;
  }
  const absolute = path.resolve(root, normalized);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    results.MISSING.push({ source, target: normalized, reason: 'path_outside_project' });
  } else if (fs.existsSync(absolute)) {
    results.VALID.push({ source, target: normalized });
  } else {
    results.MISSING.push({ source, target: normalized, reason: 'target_not_found' });
  }
}

const commandFiles = filesRecursively(commandRoot).filter((file) => file.endsWith('.md'));
for (const file of commandFiles) {
  const source = path.relative(root, file).replaceAll('\\', '/');
  const text = fs.readFileSync(file, 'utf8');
  const structuredPaths = text.matchAll(/`((?:\.claude\/(?:skills|agents|commands)\/|scripts\/|painel\/|assets\/)[^`\s)]+)`/g);
  for (const match of structuredPaths) classify(source, match[1]);
  const markdownLinks = text.matchAll(/\]\(((?:\.claude\/(?:skills|agents|commands)\/|scripts\/|painel\/|assets\/)[^)\s]+)\)/g);
  for (const match of markdownLinks) classify(source, match[1]);
  for (const match of text.matchAll(/\b(?:Skill|Agent|Task)\(\s*["'`]([^"'`]+)["'`]/g)) {
    const target = match[1];
    if (/^ht-/i.test(target)) results.BLOCKED_EXTERNAL.push({ source, target });
    else results.LEGACY.push({ source, target: `${match[0].split('(')[0]}(${target})`, reason: 'runtime_specific_reference' });
  }
}

assert.equal(results.MISSING.length, 0, `missing local command references:\n${results.MISSING.map((item) => `${item.source} → ${item.target}`).join('\n')}`);
process.stdout.write(`Command integrity: commands=${commandFiles.length} valid=${results.VALID.length} legacy=${results.LEGACY.length} blocked_external=${results.BLOCKED_EXTERNAL.length} missing=${results.MISSING.length}\n`);
