'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { immutableCopy } = require('../../core/contracts/immutable');
const { assertProductSlug, getProductPath } = require('../../core/state/product-state');

const LOW_TICKET_STEPS = Object.freeze([
  'research', 'conception', 'profile', 'consumer', 'offer', 'product', 'quiz_optional', 'page', 'copy', 'ads', 'traffic_handoff',
]);
const LOW_TICKET_COMMANDS = Object.freeze(['lt-funil', 'lt-criar-produto', 'lt-quiz', 'lt-pagina', 'copy-anuncio']);

function assertProductPrerequisites(productPath) {
  for (const file of ['pesquisa-mercado.md', 'perfil.md', 'idconsumidor.md']) {
    if (!fs.existsSync(path.join(productPath, file))) throw new Error(`missing low ticket prerequisite: ${file}`);
  }
}

function createLowTicketPlan({ projectRoot, product_slug, quiz_required = false }) {
  const slug = assertProductSlug(product_slug);
  const productPath = getProductPath(slug, projectRoot);
  assertProductPrerequisites(productPath);
  const plan = immutableCopy({
    workflow_id: 'funnel.low_ticket', product_slug: slug, quiz_required: Boolean(quiz_required),
    steps: LOW_TICKET_STEPS.map((id) => ({ id, status: id === 'quiz_optional' && !quiz_required ? 'skipped' : 'pending' })),
    traffic_handoff: { mode: 'dry_run', approval: 'manual', campaign_creation: 'PAUSED' },
  });
  const outputPath = path.join(productPath, 'entregas', 'funil', 'low-ticket-workflow-plan.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
  return immutableCopy({ status: 'ready', output_path: outputPath, plan });
}

module.exports = { LOW_TICKET_STEPS, LOW_TICKET_COMMANDS, createLowTicketPlan };
