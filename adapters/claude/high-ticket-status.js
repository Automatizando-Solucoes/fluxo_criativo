'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { assertProductSlug, getProductPath } = require('../../core/state/product-state');

const REQUIRED_HT_COMMANDS = Object.freeze([
  'ht-big-idea', 'ht-cronograma', 'ht-pagina-inscricao', 'ht-anuncios', 'ht-comunicacao-pre',
  'ht-conteudo', 'ht-pitch-palco', 'ht-oferta', 'ht-follow-up', 'ht-diagnostico', 'ht-spin',
  'ht-apresentacao-proposta', 'ht-proposta', 'ht-fechamento', 'ht-objecoes', 'ht-whatsapp', 'ht-onboarding',
]);

function existingHighTicketArtifacts(productPath) {
  const artifactPath = path.join(productPath, 'entregas', 'ht');
  if (!fs.existsSync(artifactPath)) return [];
  return fs.readdirSync(artifactPath, { recursive: true })
    .filter((entry) => typeof entry === 'string')
    .sort();
}

function getHighTicketStatus({ projectRoot, product_slug }) {
  const slug = assertProductSlug(product_slug);
  const productPath = getProductPath(slug, projectRoot);
  const available = REQUIRED_HT_COMMANDS.filter((command) => fs.existsSync(path.join(projectRoot, '.claude', 'commands', `${command}.md`)));
  const missing = REQUIRED_HT_COMMANDS.filter((command) => !available.includes(command));
  if (missing.length === 0) {
    return Object.freeze({ status: 'available', product_slug: slug, available_commands: available });
  }
  return Object.freeze({
    status: 'BLOCKED_EXTERNAL',
    code: 'c10x_skills_unavailable',
    product_slug: slug,
    missing_dependencies: Object.freeze(missing),
    existing_artifacts: Object.freeze(existingHighTicketArtifacts(productPath)),
    message: 'A metodologia C10X depende das skills ht-* externas, que não estão presentes neste repositório. Nenhuma substituição será inventada.',
    resume_when: 'Instale ou disponibilize o plugin C10X com as skills ht-* e execute novamente o roteamento High Ticket.',
  });
}

module.exports = { REQUIRED_HT_COMMANDS, getHighTicketStatus };
