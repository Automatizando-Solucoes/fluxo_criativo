#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '../..')
const commands = [
  'configurar-apify.md',
  'configurar-heygen.md',
  'configurar-imagens.md',
  'configurar-replicate.md',
  'configurar-telegram.md',
  'configurar-zapi.md',
]
const forbidden = ['Cole o token', 'Cole a chave', 'TOKEN_INFORMADO', 'CHAVE_INFORMADA']

for (const command of commands) {
  const content = fs.readFileSync(path.join(root, '.claude/commands', command), 'utf8')
  const found = forbidden.filter(pattern => content.includes(pattern))
  if (found.length > 0) throw new Error(`${command}: ${found.join(', ')}`)
}

const references = fs.readFileSync(path.join(root, '.env.op.example'), 'utf8')
for (const line of references.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue
  const [, value] = line.split('=', 2)
  if (!value || !value.startsWith('op://')) throw new Error(`invalid secret reference: ${line}`)
}

process.stdout.write('1Password secret policy: ok\n')
