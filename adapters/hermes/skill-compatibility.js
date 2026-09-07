'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');

const SKILL_CLASSES = Object.freeze(['HERMES_NATIVE', 'HERMES_WRAPPER', 'HERMES_BLOCKED_EXTERNAL', 'CLAUDE_ONLY_TEMP']);

const skillCompatibility = immutableCopy([
  {
    id: 'revisora', classification: 'HERMES_NATIVE',
    source: '.claude/skills/revisora/SKILL.md',
    reason: 'Metodologia de revisão e referências locais; não executa provider nem comando Claude.',
  },
  {
    id: 'elementos-literarios', classification: 'HERMES_NATIVE',
    source: '.claude/skills/elementos-literarios/SKILL.md',
    reason: 'Conhecimento metodológico de Light Copy sem operação de runtime.',
  },
  {
    id: 'manual-copy', classification: 'HERMES_NATIVE',
    source: '.claude/skills/revisora/references/manual-copy.md',
    reason: 'Referência metodológica local usada pela revisora.',
  },
  {
    id: 'pesquisa-mercado', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/pesquisa-mercado/SKILL.md',
    reason: 'Método reutilizável, mas a coleta requer pesquisa externa e adapter/gate.',
  },
  {
    id: 'video-avancado', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/video-avancado/SKILL.md',
    reason: 'Metodologia de vídeo reutilizável; renderers locais e externos permanecem dry-run.',
  },
  ...['instagram-dashboard', 'tiktok-dashboard', 'youtube-dashboard', 'linkedin-dashboard'].map((id) => ({
    id, classification: 'HERMES_WRAPPER', source: `.claude/skills/${id}/SKILL.md`,
    reason: 'Metodologia de dashboard reutilizável; Apify permanece no boundary externo dry-run.',
  })),
  {
    id: 'anuncios', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/anuncios/SKILL.md',
    reason: 'Conhecimento reutilizável, com acoplamento declarativo ao command Claude.',
  },
  {
    id: 'paginas', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/paginas/SKILL.md',
    reason: 'Conhecimento reutilizável, mas orienta commands, scripts e escrita de artefatos.',
  },
  {
    id: 'vtsd-completo', classification: 'HERMES_NATIVE',
    source: '.claude/skills/vtsd-completo/SKILL.md',
    reason: 'Metodologia de produto local reutilizável pelo wrapper Hermes de produto.',
  },
  {
    id: 'criacao-produto-low-ticket', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/criacao-produto-low-ticket/SKILL.md',
    reason: 'Estrutura de Low Ticket reutilizável; o handoff Meta continua externo em dry-run.',
  },
  {
    id: 'carrossel', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/carrossel/SKILL.md',
    reason: 'Metodologia de conteúdo local; publicação e scheduling não são autorizados pela skill.',
  },
  {
    id: 'trafego-pago', classification: 'HERMES_NATIVE',
    source: '.claude/skills/trafego-pago/SKILL.md',
    reason: 'Conhecimento metodológico de estrutura, métricas e decisões de tráfego sem transport de provider.',
  },
  {
    id: 'trafego-insights', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/trafego-insights/SKILL.md',
    reason: 'Metodologia segura; ads.insights continua capability externa via adapter.',
  },
  {
    id: 'trafego-analise', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/trafego-analise/SKILL.md',
    reason: 'Diagnóstico VTSD reutilizável, com aquisição delegada a ads.insights.',
  },
  {
    id: 'trafego-criar-campanha', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/trafego-criar-campanha/SKILL.md',
    reason: 'Estrutura de campanha segura, mas ads.campaign.create exige manual e PAUSED.',
  },
  {
    id: 'trafego-otimizar', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/trafego-otimizar/SKILL.md',
    reason: 'Diagnóstico e decisões reutilizáveis; mudanças externas ficam em operations tipadas.',
  },
  {
    id: 'trafego-escalar', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/trafego-escalar/SKILL.md',
    reason: 'Metodologia de escala segura, mas ads.scale é FINANCIAL_WRITE com grant manual.',
  },
  {
    id: 'social-publish', classification: 'HERMES_BLOCKED_EXTERNAL',
    source: '.claude/commands/copy-social.md',
    reason: 'Geração de conteúdo é reutilizável, mas publicação orgânica exige adapter oficial por plataforma.',
  },
  {
    id: 'estrategista-ht', classification: 'HERMES_BLOCKED_EXTERNAL',
    source: '.claude/agents/estrategista-ht.md',
    reason: 'C10X depende das skills ht-* externas; Hermes preserva somente o diagnóstico de dependência.',
  },
]);

function getSkillCompatibility(id) {
  const entry = skillCompatibility.find((skill) => skill.id === id);
  if (!entry) throw new Error(`unclassified Hermes skill: ${id}`);
  return entry;
}

function isHermesWrapperCandidate(skill) {
  return skill.classification === 'HERMES_WRAPPER';
}

module.exports = { SKILL_CLASSES, skillCompatibility, getSkillCompatibility, isHermesWrapperCandidate };
