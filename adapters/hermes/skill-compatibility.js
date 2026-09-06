'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');

const SKILL_CLASSES = Object.freeze(['HERMES_NATIVE', 'HERMES_WRAPPER', 'CLAUDE_ONLY_TEMP']);

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
    id: 'anuncios', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/anuncios/SKILL.md',
    reason: 'Conhecimento reutilizável, com acoplamento declarativo ao command Claude.',
  },
  {
    id: 'paginas', classification: 'HERMES_WRAPPER',
    source: '.claude/skills/paginas/SKILL.md',
    reason: 'Conhecimento reutilizável, mas orienta commands, scripts e escrita de artefatos.',
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
