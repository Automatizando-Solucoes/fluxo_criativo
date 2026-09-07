#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  META_ACCESS_TOKEN,
  createMetaAuthDescriptor,
  createMetaOperationDescriptor,
} = require('../../adapters/claude/meta-ads');

const root = path.resolve(__dirname, '../..');
const commandsRoot = path.join(root, '.claude', 'commands');
const metaCommand = /^(?:ads-relatorio|enviar-relatorio-ads|gerar-token(?:-permanente)?-facebook-ads|meta-conexao|obter-id-conta-anuncios|criar-aplicativo-analise-ads|trafego-).*\.md$/;
const canonicalCommands = fs.readdirSync(commandsRoot)
  .filter((file) => metaCommand.test(file))
  .map((file) => ({ file, text: fs.readFileSync(path.join(commandsRoot, file), 'utf8') }));

assert.ok(canonicalCommands.length >= 13, 'all named canonical Meta commands must be audited');

const prohibitedOperationalPatterns = [
  /TOKEN_AQUI/i,
  /TOKEN_DO_ENV/i,
  /access_token\s*=/i,
  /cole\s+(?:o\s+)?token/i,
  /cole\s+(?:sua\s+)?chave/i,
  /envie\s+(?:o\s+)?token/i,
  /digite\s+(?:o\s+)?token/i,
  /leia\s+(?:o\s+)?token\s+do\s+\.env/i,
  /(?:use|leia|salve|grave|copie)\s+`?(?:FB_ACCESS_TOKEN_PERMANENTE|FB_ACCESS_TOKEN_TEMPORARIO|ACCESS_TOKEN)`?\s+(?:do|no|para)/i,
  /(?:use|execute|rode)\s+`?op read/i,
];

for (const { file, text } of canonicalCommands) {
  for (const pattern of prohibitedOperationalPatterns) {
    assert.equal(pattern.test(text), false, `${file} contains an operational Meta secret flow: ${pattern}`);
  }
}

for (const operation of ['meta.auth.validate', 'meta.accounts.list']) {
  const descriptor = createMetaAuthDescriptor(operation);
  assert.equal(descriptor.provider, 'meta');
  assert.equal(descriptor.required_secret, META_ACCESS_TOKEN);
  assert.equal(descriptor.mode, 'dry_run');
  assert.equal(Object.hasOwn(descriptor, 'token'), false);
}

const insights = createMetaOperationDescriptor('ads.insights');
assert.equal(insights.class, 'READ');
assert.equal(insights.financial, false);
const create = createMetaOperationDescriptor('ads.campaign.create');
assert.equal(create.class, 'WRITE');
assert.equal(create.approval, 'manual');
const scale = createMetaOperationDescriptor('ads.scale');
assert.equal(scale.class, 'FINANCIAL_WRITE');
assert.equal(scale.financial, true);
assert.equal(scale.approval, 'manual');
assert.equal(createMetaOperationDescriptor('raw_request').reason, 'operation_not_allowlisted');

process.stdout.write(`Meta secret command integrity: ok (${canonicalCommands.length} commands)\n`);
