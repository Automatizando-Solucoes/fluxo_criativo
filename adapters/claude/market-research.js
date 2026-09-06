'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { assertProductSlug, getProductPath } = require('../../core/state/product-state');

const RESEARCH_AXES = Object.freeze([
  'Tamanho e Saúde do Mercado',
  'Concorrentes',
  'Faixa de Preço',
  'Público-Alvo Real',
  'Objeções Reais',
  'Assuntos Quentes e Ângulos Virais',
  'YouTube. Top 10 Vídeos do Nicho',
  'Biblioteca de Anúncios',
  'Riscos Regulatórios e Éticos',
]);

const SPECIALIZED_PROVIDERS = Object.freeze({
  apify: Object.freeze({ operation_id: 'research.fetch', secret_name: 'APIFY_API_TOKEN' }),
  ads_library: Object.freeze({ operation_id: 'research.fetch', secret_name: 'META_ACCESS_TOKEN' }),
});

function assertText(value, name) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
  return value.trim();
}

function assertResearchDate(date) {
  const value = assertText(date, 'researched_at');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))) {
    throw new TypeError('researched_at must use YYYY-MM-DD');
  }
  return value;
}

function normalizeAxis(axis, index) {
  if (!axis || typeof axis !== 'object') throw new TypeError(`axis ${index + 1} is required`);
  const findings = Array.isArray(axis.findings) ? axis.findings : [];
  if (findings.length === 0) throw new TypeError(`axis ${index + 1} requires findings`);
  return findings.map((finding) => {
    if (!finding || typeof finding !== 'object') throw new TypeError(`axis ${index + 1} finding must be an object`);
    const kind = finding.kind;
    if (kind !== 'fact' && kind !== 'inference') throw new TypeError('research finding kind must be fact or inference');
    return {
      kind,
      statement: assertText(finding.statement, 'research finding statement'),
      source: assertText(finding.source, 'research finding source'),
    };
  });
}

function validateResearchInput(input) {
  if (!input || typeof input !== 'object') throw new TypeError('research input must be an object');
  const axes = Array.isArray(input.axes) ? input.axes : [];
  if (axes.length !== RESEARCH_AXES.length) {
    throw new TypeError(`research requires all ${RESEARCH_AXES.length} axes`);
  }
  return {
    product_slug: assertProductSlug(input.product_slug),
    niche: assertText(input.niche, 'niche'),
    quadro: assertText(input.quadro, 'quadro'),
    intended_format: assertText(input.intended_format, 'intended_format'),
    researched_at: assertResearchDate(input.researched_at),
    axes: axes.map(normalizeAxis),
  };
}

function renderResearchMarkdown(research) {
  const lines = [
    `# Pesquisa de Mercado. ${research.niche}`,
    '',
    `**Data da pesquisa:** ${research.researched_at}`,
    `**Nicho:** ${research.niche}`,
    `**Quadro:** ${research.quadro}`,
    `**Formato pretendido:** ${research.intended_format}`,
    '',
    '> Classificação: cada item indica FATO (fonte observada) ou INFERÊNCIA (leitura derivada das fontes).',
    '',
  ];
  research.axes.forEach((findings, index) => {
    lines.push(`## ${index + 1}. ${RESEARCH_AXES[index]}`, '');
    findings.forEach((finding) => {
      const label = finding.kind === 'fact' ? 'FATO' : 'INFERÊNCIA';
      lines.push(`- **${label}:** ${finding.statement} [Fonte](${finding.source})`);
    });
    lines.push('');
  });
  return `${lines.join('\n')}\n`;
}

function createResearchArtifact({ projectRoot, input }) {
  const research = validateResearchInput(input);
  const productPath = getProductPath(research.product_slug, projectRoot);
  if (!fs.existsSync(productPath) || !fs.statSync(productPath).isDirectory()) {
    throw new Error(`product does not exist: ${research.product_slug}`);
  }
  const artifactPath = path.join(productPath, 'pesquisa-mercado.md');
  const stagedPath = `${artifactPath}.tmp`;
  const markdown = renderResearchMarkdown(research);
  fs.writeFileSync(stagedPath, markdown, 'utf8');
  fs.renameSync(stagedPath, artifactPath);
  return Object.freeze({
    status: 'ready',
    artifact_path: artifactPath,
    review: Object.freeze({ agent: 'revisor-pesquisa', input_path: artifactPath, executable: false }),
  });
}

function prepareSpecializedResearchProvider({ provider, secretProvider }) {
  const definition = SPECIALIZED_PROVIDERS[provider];
  if (!definition) throw new TypeError(`unsupported research provider: ${provider}`);
  if (!secretProvider || typeof secretProvider.has_secret !== 'function' || typeof secretProvider.run_with_secrets !== 'function') {
    throw new TypeError('specialized provider requires SecretProvider boundary');
  }
  if (!secretProvider.has_secret(definition.secret_name)) {
    return Object.freeze({ status: 'unavailable', reason: 'secret_unavailable', provider, secret_name: definition.secret_name });
  }
  const injection = secretProvider.run_with_secrets(
    { id: definition.operation_id, allowed_secret_names: [definition.secret_name] },
    [definition.secret_name],
  );
  return Object.freeze({
    status: 'dry_run',
    provider,
    operation_id: definition.operation_id,
    secret_name: definition.secret_name,
    injection,
  });
}

function preserveExistingResearchOnSourceFailure({ projectRoot, product_slug, reason }) {
  const productPath = getProductPath(assertProductSlug(product_slug), projectRoot);
  const artifactPath = path.join(productPath, 'pesquisa-mercado.md');
  return Object.freeze({
    status: 'source_failed',
    reason: assertText(reason, 'reason'),
    preserved_existing_artifact: fs.existsSync(artifactPath),
    artifact_path: artifactPath,
  });
}

module.exports = {
  RESEARCH_AXES,
  SPECIALIZED_PROVIDERS,
  validateResearchInput,
  renderResearchMarkdown,
  createResearchArtifact,
  prepareSpecializedResearchProvider,
  preserveExistingResearchOnSourceFailure,
};
