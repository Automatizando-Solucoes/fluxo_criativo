'use strict';

const workflowDefinitions = [
  {
    id: 'research.market', version: 1, category: 'research',
    inputs: { product_slug: { required: true }, research_goal: { required: false } },
    outputs: ['research_file'], requires: ['product.profile'],
    capabilities: ['filesystem.read', 'filesystem.write', 'research.fetch'],
    side_effects: { external: false, financial: false }, approval: { required: false },
    source: { kind: 'claude.skill', path: '.claude/skills/pesquisa-mercado/SKILL.md' },
  },
  {
    id: 'copy.page', version: 1, category: 'copy',
    inputs: { product_slug: { required: true }, page_type: { required: true } },
    outputs: ['copy_file'], requires: ['product.profile', 'product.research'],
    capabilities: ['filesystem.read', 'filesystem.write'],
    side_effects: { external: false, financial: false }, approval: { required: false },
    source: { kind: 'claude.skill', path: '.claude/skills/paginas/SKILL.md' },
  },
  {
    id: 'copy.ad', version: 1, category: 'copy',
    inputs: { product_slug: { required: true }, offer: { required: true } },
    outputs: ['ad_copy_file'], requires: ['product.profile', 'product.research'],
    capabilities: ['filesystem.read', 'filesystem.write'],
    side_effects: { external: false, financial: false }, approval: { required: false },
    source: { kind: 'claude.skill', path: '.claude/skills/anuncios-texto/SKILL.md' },
  },
  {
    id: 'copy.social', version: 1, category: 'copy',
    inputs: { product_slug: { required: true }, platform: { required: true } },
    outputs: ['content_file'], requires: ['product.profile', 'product.research'],
    capabilities: ['filesystem.read', 'filesystem.write'],
    side_effects: { external: false, financial: false }, approval: { required: false },
    source: { kind: 'claude.skill', path: '.claude/skills/conteudo/SKILL.md' },
  },
  {
    id: 'creative.static', version: 1, category: 'creative',
    inputs: { product_slug: { required: true }, brief: { required: true } },
    outputs: ['creative_brief'], requires: ['product.profile', 'product.research'],
    capabilities: ['filesystem.read', 'filesystem.write', 'image.generate'],
    side_effects: { external: false, financial: false }, approval: { required: false },
    source: { kind: 'claude.command', path: '.claude/commands/criativo-estatico.md' },
  },
  {
    id: 'traffic.insights', version: 1, category: 'traffic',
    inputs: { product_slug: { required: true }, period: { required: false } },
    outputs: ['traffic_insights_file'], requires: ['product.profile'],
    capabilities: ['filesystem.read', 'filesystem.write', 'ads.insights'],
    side_effects: { external: false, financial: false }, approval: { required: false },
    source: { kind: 'claude.skill', path: '.claude/skills/trafego-insights/SKILL.md' },
  },
  {
    id: 'toolkit.execute', version: 1, category: 'toolkit',
    inputs: { product_slug: { required: true }, plan: { required: true } },
    outputs: ['execution_report'], requires: ['product.profile'],
    capabilities: ['filesystem.read', 'filesystem.write'],
    side_effects: { external: false, financial: false }, approval: { required: false },
    source: { kind: 'claude.command', path: '.claude/commands/toolkit-executar.md' },
  },
];

module.exports = { workflowDefinitions };
