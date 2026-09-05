#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const os = require('os')
const { execFileSync } = require('child_process')
const root = path.resolve(__dirname, '../..')

const hook = fs.readFileSync(
  path.join(root, '.claude/hooks/agent-status-writer.js'),
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

if (!hook.includes("const PROJECT_ROOT = path.resolve(__dirname, '..', '..')")) {
  throw new Error('agent-status-writer must derive PROJECT_ROOT from its own path')
}
if (hook.includes('data.cwd || process.cwd()')) {
  throw new Error('event cwd must not control hook filesystem writes')
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'status-hook-project-'))
const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'status-hook-outside-'))
const fixtureHook = path.join(fixtureRoot, '.claude', 'hooks', 'agent-status-writer.js')
const fixtureStatus = path.join(fixtureRoot, '.claude', 'agents-memory', 'agents-status.json')
try {
  fs.mkdirSync(path.dirname(fixtureHook), { recursive: true })
  fs.copyFileSync(path.join(root, '.claude', 'hooks', 'agent-status-writer.js'), fixtureHook)
  execFileSync(process.execPath, [fixtureHook], {
    input: JSON.stringify({ cwd: outsideRoot, tool_name: 'Read', tool_input: {} }),
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  if (!fs.existsSync(fixtureStatus)) throw new Error('status file was not written below PROJECT_ROOT')
  if (fs.existsSync(path.join(outsideRoot, '.claude', 'agents-memory', 'agents-status.json'))) {
    throw new Error('status file escaped PROJECT_ROOT through event cwd')
  }
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
  fs.rmSync(outsideRoot, { recursive: true, force: true })
}

process.stdout.write('agent-status-writer local-only and project-root policy: ok\n')
