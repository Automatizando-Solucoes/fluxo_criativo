#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const hook = fs.readFileSync(
  path.resolve(__dirname, '../../.claude/hooks/agent-status-writer.js'),
  'utf8',
)
const forbidden = [
  'WORKSHOP_TOKEN',
  'WORKSHOP_API_URL',
  'http://',
  'https://',
  "require('http')",
  "require('https')",
  'fetch(',
  '.request(',
]

const found = forbidden.filter(pattern => hook.includes(pattern))
if (found.length > 0) {
  throw new Error(`agent-status-writer must remain local-only: ${found.join(', ')}`)
}

process.stdout.write('agent-status-writer local-only policy: ok\n')
