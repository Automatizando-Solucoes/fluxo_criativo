#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createCodexLocal } = require('../../adapters/codex/workflows');
const { resolveCodexWorkflow } = require('../../adapters/codex/resolver');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-local-')); const slug = 'produto-codex';
const pageCopy = Array.from({ length: 16 }, (_, i) => `## Bloco ${String(i + 1).padStart(2, '0')}\nTexto específico validado.`).join('\n\n');
try {
  const create = createCodexLocal({ workflow_id: 'product.create', projectRoot: root, product_slug: slug, name: 'Produto Codex', type: 'Low Ticket', price: 'R$47' });
  assert.equal(create.result.slug, slug); assert.throws(() => createCodexLocal({ workflow_id: 'product.create', projectRoot: root, product_slug: slug, name: 'Duplicado', type: 'Low Ticket', price: 'R$47' }));
  createCodexLocal({ workflow_id: 'product.select', projectRoot: root, product_slug: slug });
  const product = path.join(root, 'meus-produtos', slug); for (const name of ['pesquisa-mercado.md', 'perfil.md', 'idconsumidor.md']) fs.writeFileSync(path.join(product, name), '# fixture\n');
  const results = [
    createCodexLocal({ workflow_id: 'copy.page', projectRoot: root, product_slug: slug, page_type: 'vendas', content: pageCopy }),
    createCodexLocal({ workflow_id: 'copy.ad', projectRoot: root, product_slug: slug, offer: 'Oferta', content: 'Texto específico validado.' }),
    createCodexLocal({ workflow_id: 'copy.social', projectRoot: root, product_slug: slug, platform: 'instagram', content: 'Texto específico validado.' }),
    createCodexLocal({ workflow_id: 'copy.script', projectRoot: root, product_slug: slug, objective: 'vender', content: 'Roteiro específico validado.' }),
    createCodexLocal({ workflow_id: 'funnel.low_ticket', projectRoot: root, product_slug: slug, quiz_required: true }),
    createCodexLocal({ workflow_id: 'funnel.middle_ticket', projectRoot: root, product_slug: slug }),
  ];
  for (const entry of results) assert.equal(entry.result.output_path.startsWith(`${product}${path.sep}`), true);
  assert.equal(results[2].result.review.status, 'passed'); assert.equal(results[4].result.plan.traffic_handoff.campaign_creation, 'PAUSED');
  const page = createCodexLocal({ workflow_id: 'page.sales', projectRoot: root, product_slug: slug, html: '<html><body><img src="assets/mock.png"></body></html>', copy_review: results[0].result.review });
  const carousel = createCodexLocal({ workflow_id: 'carousel.generate', projectRoot: root, product_slug: slug, slug: 'lancamento', slides: ['Um', 'Dois'], caption: 'Legenda', cta: 'CTA', visual_prompts: ['Prompt um', 'Prompt dois'] });
  const schedule = createCodexLocal({ workflow_id: 'carousel.schedule', projectRoot: root, product_slug: slug, slug: 'lancamento', schedule_id: 's1', schedule: '0 9 * * 1', timezone: 'America/Manaus' });
  const commercial = createCodexLocal({ workflow_id: 'commercial.playbook', product_slug: slug });
  assert.equal(page.result.deploy.approved, false); assert.equal(carousel.result.artifact.publication.autopublish, false); assert.equal(schedule.result.descriptor.mode, 'dry_run'); assert.equal(commercial.result.status, 'READY');
  for (const id of ['product.create', 'product.select', 'copy.page', 'copy.ad', 'copy.social', 'copy.script', 'page.sales', 'carousel.generate', 'carousel.schedule', 'commercial.playbook']) assert.equal(resolveCodexWorkflow(id).local_executable, true);
} finally { fs.rmSync(root, { recursive: true, force: true }); }
process.stdout.write('Codex local workflows: ok\n');
