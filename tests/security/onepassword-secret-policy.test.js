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
const secretEnvs = [
  'VERCEL_TOKEN', 'FREEPIK_API_KEY', 'HEYGEN_API_KEY', 'META_ACCESS_TOKEN',
  'META_PIXEL_CAPI_TOKEN', 'META_PIXEL_TEST_EVENT_CODE', 'GOOGLE_ADS_DEVELOPER_TOKEN',
  'HOTMART_TOKEN', 'WHATSAPP_ACCESS_TOKEN', 'TELEGRAM_BOT_TOKEN',
  'FB_ACCESS_TOKEN_PERMANENTE', 'FB_ACCESS_TOKEN_TEMPORARIO', 'ZAPI_TOKEN',
  'ZAPI_CLIENT_TOKEN', 'OPENROUTER_API_KEY', 'GEMINI_API_KEY',
]

for (const command of commands) {
  const content = fs.readFileSync(path.join(root, '.claude/commands', command), 'utf8')
  const found = forbidden.filter(pattern => content.includes(pattern))
  if (found.length > 0) throw new Error(`${command}: ${found.join(', ')}`)
}

const references = fs.readFileSync(path.join(root, '.env.op.example'), 'utf8')
const legacyEnv = fs.readFileSync(path.join(root, '.env.example'), 'utf8')
const catalog = fs.readFileSync(path.join(root, 'docs/security/ONEPASSWORD.md'), 'utf8')
for (const line of references.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue
  const [, value] = line.split('=', 2)
  if (!value || !value.startsWith('op://')) throw new Error(`invalid secret reference: ${line}`)
}

for (const env of secretEnvs) {
  if (!catalog.includes(`\`${env}\``)) throw new Error(`undocumented secret: ${env}`)
  if (!references.split(/\r?\n/).some(line => line.startsWith(`${env}=op://`))) {
    throw new Error(`missing 1Password reference: ${env}`)
  }
}

if (/cole\s+(a\s+)?chave|preencha\s+suas\s+chaves|salve\s+a\s+chave/i.test(legacyEnv)) {
  throw new Error('.env.example encourages plaintext configuration')
}
for (const line of legacyEnv.split(/\r?\n/)) {
  if (!line || line.startsWith('#')) continue
  if (!/^[A-Z0-9_]+=$/.test(line)) throw new Error(`unexpected legacy value: ${line}`)
}

process.stdout.write('1Password secret policy: ok\n')
