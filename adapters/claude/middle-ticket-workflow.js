'use strict';
const fs = require('node:fs'); const path = require('node:path');
const { immutableCopy } = require('../../core/contracts/immutable');
const { assertProductSlug, getProductPath } = require('../../core/state/product-state');

const MIDDLE_TICKET_STEPS = Object.freeze(['research', 'conception', 'identity', 'offer', 'page_8d', 'copy', 'creatives', 'ads_plan', 'traffic_handoff']);
const MIDDLE_TICKET_SOURCES = Object.freeze(['.claude/agents/estrategista-middle-ticket.md', '.claude/commands/copy-pagina.md', '.claude/commands/copy-anuncio.md']);
function createMiddleTicketPlan({ projectRoot, product_slug }) {
  const slug = assertProductSlug(product_slug); const product = getProductPath(slug, projectRoot);
  for (const file of ['pesquisa-mercado.md', 'perfil.md', 'idconsumidor.md']) if (!fs.existsSync(path.join(product, file))) throw new Error(`missing middle ticket prerequisite: ${file}`);
  const plan = immutableCopy({ workflow_id: 'funnel.middle_ticket', product_slug: slug, steps: MIDDLE_TICKET_STEPS.map((id) => ({ id, status: 'pending' })), traffic_handoff: { mode: 'dry_run', approval: 'manual', provider: 'meta', external_capability_granted: false } });
  const outputPath = path.join(product, 'entregas', 'funil', 'middle-ticket-workflow-plan.json'); fs.mkdirSync(path.dirname(outputPath), { recursive: true }); fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);
  return immutableCopy({ status: 'ready', output_path: outputPath, plan });
}
module.exports = { MIDDLE_TICKET_STEPS, MIDDLE_TICKET_SOURCES, createMiddleTicketPlan };
