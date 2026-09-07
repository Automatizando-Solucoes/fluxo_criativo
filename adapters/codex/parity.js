'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');
const { workflowRegistry } = require('../../core/workflows/registry');

const READY = new Set(['product.create', 'product.select', 'copy.page', 'copy.ad', 'copy.social', 'copy.script', 'page.sales', 'carousel.generate', 'carousel.schedule', 'plan.execute', 'toolkit.execute', 'commercial.playbook']);
const BLOCKED = new Set(['social.publish']);
const LEGACY = new Set(['traffic.insights']);
const SOURCES = Object.freeze({
  'product.create': 'agents/methodology/product/lifecycle.md', 'product.select': 'agents/methodology/product/lifecycle.md',
  'research.market': 'agents/skills/pesquisa-mercado/SKILL.md', 'copy.page': 'agents/skills/paginas/SKILL.md', 'copy.ad': 'agents/skills/anuncios/SKILL.md', 'copy.social': 'agents/skills/revisora/SKILL.md', 'copy.script': 'agents/methodology/copy/manual-copy.md',
  'funnel.low_ticket': 'agents/skills/criacao-produto-low-ticket/SKILL.md', 'funnel.middle_ticket': 'agents/methodology/funnels/middle-ticket.md', 'page.sales': 'agents/skills/paginas/SKILL.md', 'carousel.generate': 'agents/skills/carrossel/SKILL.md', 'carousel.schedule': 'agents/methodology/orchestration/plan-toolkit.md',
  'image.generate': 'agents/methodology/creative/static.md', 'creative.static': 'agents/methodology/creative/static.md', 'video.generate': 'agents/skills/video-avancado/SKILL.md',
  'ads.insights': 'agents/skills/trafego-insights/SKILL.md', 'traffic.insights': 'agents/skills/trafego-insights/SKILL.md', 'ads.campaign.create': 'agents/skills/trafego-criar-campanha/SKILL.md', 'ads.optimize': 'agents/skills/trafego-otimizar/SKILL.md', 'ads.scale': 'agents/skills/trafego-escalar/SKILL.md', 'ads.report': 'agents/methodology/traffic/ads-report.md',
  'social.dashboard': 'agents/skills/dashboard-social/SKILL.md', 'social.publish': 'agents/methodology/social/publishing.md', 'plan.execute': 'agents/methodology/orchestration/plan-toolkit.md', 'toolkit.execute': 'agents/methodology/orchestration/plan-toolkit.md', 'commercial.playbook': 'agents/methodology/commercial/playbook.md',
});
function codexStatus(id) { return READY.has(id) ? 'CODEX_READY' : BLOCKED.has(id) ? 'CODEX_BLOCKED_EXTERNAL' : LEGACY.has(id) ? 'CODEX_LEGACY' : 'CODEX_EXTERNAL_DRY_RUN'; }
function buildCodexParityMatrix(registry = workflowRegistry) { return immutableCopy(registry.list().map((workflow) => ({ workflow_id: workflow.id, codex_status: codexStatus(workflow.id), entrypoint: 'AGENTS.md', methodology_source: SOURCES[workflow.id], core_source: workflow.source, external: workflow.side_effects.external, financial: workflow.side_effects.financial, approval_required: workflow.approval.required, kind: workflow.kind, risk_from_children: workflow.risk_from_children }))); }
module.exports = { READY, BLOCKED, LEGACY, SOURCES, codexStatus, buildCodexParityMatrix };
