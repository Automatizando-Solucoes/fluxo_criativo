'use strict';

// Fonte verificável da metodologia compartilhada. legacy_source é somente
// inventário de migração e nunca uma dependência dos runtimes.
const METHODOLOGY_MANIFEST = Object.freeze([
  { id: 'pesquisa-mercado', canonical_path: 'agents/skills/pesquisa-mercado/SKILL.md', legacy_source: '.claude/skills/pesquisa-mercado/LEGACY-METHODOLOGY.md', required_sections: ['Nove eixos', 'Quando acionar e entrada mínima', 'Critérios dos nove eixos', 'Diversidade, falha e saída'] },
  { id: 'trafego-insights', canonical_path: 'agents/skills/trafego-insights/SKILL.md', legacy_source: '.claude/skills/trafego-insights/legacy-runtime/LEGACY-RUNTIME.md', required_sections: ['Inputs, trilha e janelas', 'Métricas e fórmulas', 'Conta, cache e falha parcial', 'Breakdowns e output'] },
  { id: 'trafego-analise', canonical_path: 'agents/skills/trafego-analise/SKILL.md', legacy_source: '.claude/skills/trafego-analise/legacy-runtime/LEGACY-RUNTIME.md', required_sections: ['Diagnóstico VTSD', 'Roteamento por output', 'Health score e evidência', 'Protocolo dos dez outputs'] },
  { id: 'trafego-criar-campanha', canonical_path: 'agents/skills/trafego-criar-campanha/SKILL.md', legacy_source: '.claude/skills/trafego-criar-campanha/legacy-runtime/LEGACY-RUNTIME.md', required_sections: ['Coleta e estrutura', 'Públicos, criativos e tracking', 'Preview, validação e falha'] },
  { id: 'trafego-otimizar', canonical_path: 'agents/skills/trafego-otimizar/SKILL.md', legacy_source: '.claude/skills/trafego-otimizar/legacy-runtime/LEGACY-RUNTIME.md', required_sections: ['Diagnóstico e trilhas', 'Critérios de decisão', 'Handoff e revalidação'] },
  { id: 'trafego-escalar', canonical_path: 'agents/skills/trafego-escalar/SKILL.md', legacy_source: '.claude/skills/trafego-escalar/legacy-runtime/LEGACY-RUNTIME.md', required_sections: ['Modos e prontidão', 'Velocidade, freios e tetos', 'Gate financeiro e output'] },
  { id: 'paginas', canonical_path: 'agents/skills/paginas/SKILL.md', legacy_source: '.claude/skills/paginas/legacy-runtime/LEGACY-RUNTIME.md', required_sections: ['Estrutura e seleção de seções', 'Design e conteúdo', 'Validação'] },
  { id: 'carrossel', canonical_path: 'agents/skills/carrossel/SKILL.md', legacy_source: '.claude/skills/carrossel/legacy-runtime/LEGACY-RUNTIME.md', required_sections: ['Estilo e progressão', 'Estrutura criativa', 'Entrega e revisão'] },
  { id: 'dashboard-social', canonical_path: 'agents/skills/dashboard-social/SKILL.md', legacy_source: '.claude/skills/dashboard-social/legacy-runtime/LEGACY-RUNTIME.md', required_sections: ['Método', 'Leitura por plataforma e decisão', 'Cache e falha'] },
]);

module.exports = { METHODOLOGY_MANIFEST };
