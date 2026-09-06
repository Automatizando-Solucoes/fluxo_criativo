#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const { LOW_TICKET_COMMANDS, createLowTicketPlan } = require('../../adapters/claude/low-ticket-workflow');
const root = path.resolve(__dirname, '../..');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-lt-'));
try {
  const product = path.join(fixture, 'meus-produtos', 'produto-lt'); fs.mkdirSync(product, { recursive: true });
  assert.throws(() => createLowTicketPlan({ projectRoot: fixture, product_slug: 'produto-lt' }), /pesquisa-mercado/);
  for (const file of ['pesquisa-mercado.md', 'perfil.md', 'idconsumidor.md']) fs.writeFileSync(path.join(product, file), '# fixture\n');
  const result = createLowTicketPlan({ projectRoot: fixture, product_slug: 'produto-lt', quiz_required: true });
  assert.equal(result.status, 'ready'); assert.equal(result.plan.steps.find((step) => step.id === 'quiz_optional').status, 'pending');
  assert.equal(result.plan.traffic_handoff.mode, 'dry_run'); assert.equal(result.plan.traffic_handoff.campaign_creation, 'PAUSED');
  assert.equal(fs.existsSync(result.output_path), true);
} finally { fs.rmSync(fixture, { recursive: true, force: true }); }
for (const command of LOW_TICKET_COMMANDS) assert.equal(fs.existsSync(path.join(root, '.claude/commands', `${command}.md`)), true, command);
process.stdout.write('Claude Low Ticket workflow: ok\n');
