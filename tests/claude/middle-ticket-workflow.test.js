#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict'); const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const { MIDDLE_TICKET_SOURCES, createMiddleTicketPlan } = require('../../adapters/claude/middle-ticket-workflow'); const root = path.resolve(__dirname, '../..');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-mt-'));
try { const product = path.join(fixture, 'meus-produtos', 'produto-mt'); fs.mkdirSync(product, { recursive: true }); for (const file of ['pesquisa-mercado.md', 'perfil.md', 'idconsumidor.md']) fs.writeFileSync(path.join(product, file), '# fixture\n'); const result = createMiddleTicketPlan({ projectRoot: fixture, product_slug: 'produto-mt' }); assert.equal(result.status, 'ready'); assert.equal(result.plan.steps.find((step) => step.id === 'page_8d').status, 'pending'); assert.equal(result.plan.traffic_handoff.external_capability_granted, false); assert.equal(fs.existsSync(result.output_path), true); } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
for (const source of MIDDLE_TICKET_SOURCES) assert.equal(fs.existsSync(path.join(root, source)), true, source); process.stdout.write('Claude Middle Ticket workflow: ok\n');
