'use strict';

// Runtime-neutral local workflow boundaries. They write only through product-state
// paths so Claude and Hermes can share the same business contract.
const fs = require('node:fs');
const path = require('node:path');

const { immutableCopy } = require('../contracts/immutable');
const { assertProductSlug, getProductPath } = require('../state/product-state');
const { assertTimezone } = require('../scheduling/job');

const PRODUCT_TYPES = Object.freeze(['Low Ticket', 'Middle Ticket']);
const DELIVERY_DIRECTORIES = Object.freeze([
  'entregas/paginas', 'entregas/emails', 'entregas/copy-pagina', 'entregas/criativos', 'entregas/comercial', 'entregas/textos-de-venda',
]);
const MANUAL_COPY_PATH = '.claude/skills/revisora/references/manual-copy.md';
const REQUIRED_KNOWLEDGE_PATHS = Object.freeze([
  MANUAL_COPY_PATH, '.claude/skills/elementos-literarios/SKILL.md', '.claude/skills/revisora/SKILL.md',
]);
const COPY_WORKFLOWS = Object.freeze({
  'copy.page': Object.freeze({ command: 'copy-pagina', output: (slug) => `entregas/copy-pagina/copy-${slug}.md`, requires_page_blocks: true }),
  'copy.ad': Object.freeze({ command: 'copy-anuncio', output: (slug) => `entregas/criativos/anuncios-${slug}.md` }),
  'copy.social': Object.freeze({ command: 'copy-social', output: (slug) => `entregas/conteudo-social/copy-social-${slug}.md` }),
  'copy.script': Object.freeze({ command: 'copy-roteiro', output: (slug) => `entregas/criativos/roteiro-${slug}.md` }),
  'copy.post_variation': Object.freeze({ command: 'copy-variacao-post', output: (slug) => `entregas/conteudo-social/variacoes-post-${slug}.md` }),
});
const FORBIDDEN_COPY_PATTERNS = Object.freeze([
  Object.freeze({ code: 'em_dash', pattern: /—/u }),
  Object.freeze({ code: 'exclamation', pattern: /!/u }),
  Object.freeze({ code: 'not_x_is_y', pattern: /(?:^|\s)não\s+(?:é|foi|era|são|eram)(?:\s|$)[^.\n]{0,100}\.\s*(?:é|foi|era|são|eram)(?:\s|$)/iu }),
  Object.freeze({ code: 'sem_precisar', pattern: /\bsem precisar\b/iu }),
  Object.freeze({ code: 'mesmo_que', pattern: /\bmesmo que\b/iu }),
  Object.freeze({ code: 'missing_ptbr_accent', pattern: /\b(?:nao|voce|tambem|estrategia|pagina|video)\b/iu }),
]);
const LOW_TICKET_STEPS = Object.freeze([
  'research', 'conception', 'profile', 'consumer', 'offer', 'product', 'quiz_optional', 'page', 'copy', 'ads', 'traffic_handoff',
]);
const LOW_TICKET_COMMANDS = Object.freeze(['lt-funil', 'lt-criar-produto', 'lt-quiz', 'lt-pagina', 'copy-anuncio']);
const MIDDLE_TICKET_STEPS = Object.freeze(['research', 'conception', 'identity', 'offer', 'page_8d', 'copy', 'creatives', 'ads_plan', 'traffic_handoff']);
const MIDDLE_TICKET_SOURCES = Object.freeze(['.claude/agents/estrategista-middle-ticket.md', '.claude/commands/copy-pagina.md', '.claude/commands/copy-anuncio.md']);

function assertNonEmptyText(value, field) {
  if (typeof value !== 'string' || value.trim().length === 0) throw new TypeError(`${field} must be a non-empty string`);
  return value.trim();
}
function assertProductType(type) {
  if (!PRODUCT_TYPES.includes(type)) throw new TypeError(`product type must be one of: ${PRODUCT_TYPES.join(', ')}`);
  return type;
}
function productsRoot(projectRoot) { return path.join(path.resolve(projectRoot), 'meus-produtos'); }
function activeProductPath(projectRoot) { return path.join(productsRoot(projectRoot), '.ativo'); }
function getProductDisplayName(productPath, slug) {
  const namePath = path.join(productPath, 'nome.txt');
  if (fs.existsSync(namePath)) { const name = fs.readFileSync(namePath, 'utf8').trim(); if (name) return name; }
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
function getPanelPath(productPath) {
  const standardPanel = path.join(productPath, 'painel-entregas.html');
  if (fs.existsSync(standardPanel)) return 'painel-entregas.html';
  return fs.readdirSync(productPath, { withFileTypes: true }).filter((entry) => entry.isFile() && /^painel-.*\.html$/.test(entry.name)).map((entry) => entry.name).sort()[0] || null;
}
function listProducts(projectRoot) {
  const root = productsRoot(projectRoot);
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.')).map((entry) => {
    try { assertProductSlug(entry.name); } catch { return null; }
    const productPath = path.join(root, entry.name); const panel = getPanelPath(productPath);
    return { slug: entry.name, nome: getProductDisplayName(productPath, entry.name), url: panel ? `${entry.name}/${panel}` : null };
  }).filter(Boolean).sort((left, right) => left.slug.localeCompare(right.slug));
}
function refreshPanelManifest(projectRoot) {
  const root = productsRoot(projectRoot); fs.mkdirSync(root, { recursive: true });
  const products = listProducts(projectRoot); const activePath = activeProductPath(projectRoot);
  const requestedActive = fs.existsSync(activePath) ? fs.readFileSync(activePath, 'utf8').trim() : null;
  const active = products.some((product) => product.slug === requestedActive) ? requestedActive : (products[0] ? products[0].slug : null);
  const manifest = { schema_version: 1, ativo: active, atualizado_em: new Date().toISOString(), produtos: products };
  fs.writeFileSync(path.join(root, 'index.js'), `// Gerado pelo contrato local core/local/workflows.js.\nwindow.MEUS_PRODUTOS = ${JSON.stringify(manifest, null, 2)};\n`, 'utf8');
  return manifest;
}
function activateProduct({ projectRoot, slug }) {
  const safeSlug = assertProductSlug(slug); const productPath = getProductPath(safeSlug, projectRoot);
  if (!fs.existsSync(productPath) || !fs.statSync(productPath).isDirectory()) throw new Error(`product does not exist: ${safeSlug}`);
  fs.mkdirSync(productsRoot(projectRoot), { recursive: true }); fs.writeFileSync(activeProductPath(projectRoot), `${safeSlug}\n`, 'utf8');
  return { slug: safeSlug, product_path: productPath, manifest: refreshPanelManifest(projectRoot) };
}
function createProduct({ projectRoot, slug, name, type, price }) {
  const safeSlug = assertProductSlug(slug); const displayName = assertNonEmptyText(name, 'name'); const productType = assertProductType(type); const productPrice = assertNonEmptyText(price, 'price'); const productPath = getProductPath(safeSlug, projectRoot);
  if (fs.existsSync(productPath)) throw new Error(`product already exists: ${safeSlug}`);
  fs.mkdirSync(productsRoot(projectRoot), { recursive: true }); fs.mkdirSync(productPath, { recursive: false });
  for (const directory of DELIVERY_DIRECTORIES) fs.mkdirSync(path.join(productPath, directory), { recursive: true });
  fs.writeFileSync(path.join(productPath, 'nome.txt'), `${displayName}\n`, 'utf8'); fs.writeFileSync(path.join(productPath, 'tipo.md'), `${productType}\n`, 'utf8'); fs.writeFileSync(path.join(productPath, 'preco.md'), `${productPrice}\n`, 'utf8');
  return activateProduct({ projectRoot, slug: safeSlug });
}

function assertCopyWorkflow(workflowId) { if (!Object.hasOwn(COPY_WORKFLOWS, workflowId)) throw new TypeError(`unsupported copy workflow: ${workflowId}`); return workflowId; }
function assertCopyContent(content) { if (typeof content !== 'string' || content.trim().length === 0) throw new TypeError('copy content must be a non-empty string'); return content; }
function reviewCopy({ workflow_id, content }) {
  const workflowId = assertCopyWorkflow(workflow_id); const text = assertCopyContent(content); const issues = [];
  for (const rule of FORBIDDEN_COPY_PATTERNS) { if (rule.pattern.test(text)) issues.push(rule.code); rule.pattern.lastIndex = 0; }
  if (COPY_WORKFLOWS[workflowId].requires_page_blocks) for (let index = 1; index <= 16; index += 1) { const block = `## Bloco ${String(index).padStart(2, '0')}`; if (!text.includes(block)) issues.push(`missing_${block.replaceAll(' ', '_').toLowerCase()}`); }
  return immutableCopy({ status: issues.length === 0 ? 'passed' : 'blocked', workflow_id: workflowId, issues, required_knowledge: REQUIRED_KNOWLEDGE_PATHS, reviewer: 'revisora' });
}
function getCopyOutputPath({ projectRoot, product_slug, workflow_id }) { const slug = assertProductSlug(product_slug); const workflowId = assertCopyWorkflow(workflow_id); return path.join(getProductPath(slug, projectRoot), COPY_WORKFLOWS[workflowId].output(slug)); }
function saveReviewedCopy({ projectRoot, product_slug, workflow_id, content, review }) {
  const text = assertCopyContent(content); const expected = reviewCopy({ workflow_id, content: text });
  if (!review || review.status !== 'passed' || expected.status !== 'passed') throw new Error('copy must pass the common review gate before it is saved');
  const outputPath = getCopyOutputPath({ projectRoot, product_slug, workflow_id }); fs.mkdirSync(path.dirname(outputPath), { recursive: true }); fs.writeFileSync(outputPath, text, 'utf8');
  return immutableCopy({ status: 'saved', workflow_id, output_path: outputPath, review: expected });
}

function assertProductPrerequisites(productPath, label) { for (const file of ['pesquisa-mercado.md', 'perfil.md', 'idconsumidor.md']) if (!fs.existsSync(path.join(productPath, file))) throw new Error(`missing ${label} prerequisite: ${file}`); }
function createLowTicketPlan({ projectRoot, product_slug, quiz_required = false }) {
  const slug = assertProductSlug(product_slug); const productPath = getProductPath(slug, projectRoot); assertProductPrerequisites(productPath, 'low ticket');
  const plan = immutableCopy({ workflow_id: 'funnel.low_ticket', product_slug: slug, quiz_required: Boolean(quiz_required), steps: LOW_TICKET_STEPS.map((id) => ({ id, status: id === 'quiz_optional' && !quiz_required ? 'skipped' : 'pending' })), traffic_handoff: { mode: 'dry_run', approval: 'manual', campaign_creation: 'PAUSED' } });
  const outputPath = path.join(productPath, 'entregas', 'funil', 'low-ticket-workflow-plan.json'); fs.mkdirSync(path.dirname(outputPath), { recursive: true }); fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8'); return immutableCopy({ status: 'ready', output_path: outputPath, plan });
}
function createMiddleTicketPlan({ projectRoot, product_slug }) {
  const slug = assertProductSlug(product_slug); const productPath = getProductPath(slug, projectRoot); assertProductPrerequisites(productPath, 'middle ticket');
  const plan = immutableCopy({ workflow_id: 'funnel.middle_ticket', product_slug: slug, steps: MIDDLE_TICKET_STEPS.map((id) => ({ id, status: 'pending' })), traffic_handoff: { mode: 'dry_run', approval: 'manual', provider: 'meta', external_capability_granted: false } });
  const outputPath = path.join(productPath, 'entregas', 'funil', 'middle-ticket-workflow-plan.json'); fs.mkdirSync(path.dirname(outputPath), { recursive: true }); fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8'); return immutableCopy({ status: 'ready', output_path: outputPath, plan });
}

function validatePageHtml(html) { if (typeof html !== 'string' || !/<html[\s>]/i.test(html) || !/<body[\s>]/i.test(html) || !/<\/html>/i.test(html)) throw new TypeError('page HTML must contain html and body structure'); if (/\b(?:src|href)=["'](?:\/|https?:\/\/)/i.test(html)) throw new Error('page assets must use relative paths'); return true; }
function buildPage({ projectRoot, product_slug, html, copy_review }) { const slug = assertProductSlug(product_slug); if (!copy_review || copy_review.status !== 'passed') throw new Error('reviewed copy is required before page build'); validatePageHtml(html); const product = getProductPath(slug, projectRoot); if (!fs.existsSync(product)) throw new Error(`product does not exist: ${slug}`); const output = path.join(product, 'entregas', 'paginas', `pagina-${slug}.html`); fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, html, 'utf8'); return immutableCopy({ status: 'built', output_path: output, deploy: { mode: 'manual', approved: false } }); }
function createCarouselArtifact({ projectRoot, product_slug, slug, slides, caption, cta, visual_prompts }) { const productSlug = assertProductSlug(product_slug); const itemSlug = assertProductSlug(slug); if (!Array.isArray(slides) || slides.length < 2 || !Array.isArray(visual_prompts) || visual_prompts.length !== slides.length) throw new TypeError('carousel requires slides and one visual prompt per slide'); if (!caption || !cta) throw new TypeError('carousel requires caption and CTA'); const output = path.join(getProductPath(productSlug, projectRoot), 'entregas', 'conteudo-social', `carrossel-${itemSlug}.json`); fs.mkdirSync(path.dirname(output), { recursive: true }); const artifact = immutableCopy({ kind: 'carousel', slug: itemSlug, slides, caption, cta, visual_prompts, publication: { autopublish: false, status: 'not_requested' } }); fs.writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8'); return immutableCopy({ status: 'ready', output_path: output, artifact }); }
function createCarouselSchedule({ projectRoot, product_slug, slug, schedule_id, schedule, timezone }) { const productSlug = assertProductSlug(product_slug); const itemSlug = assertProductSlug(slug); if (!schedule_id || !schedule || !timezone) throw new TypeError('schedule_id, schedule and timezone are required'); assertTimezone(timezone); const output = path.join(getProductPath(productSlug, projectRoot), 'agendamentos', 'carrossel', `${itemSlug}.md`); fs.mkdirSync(path.dirname(output), { recursive: true }); const descriptor = immutableCopy({ kind: 'content_schedule', schedule_id, workflow: 'carousel.schedule', schedule, timezone, publication: false, relatorio_cron_id: null, mode: 'dry_run' }); fs.writeFileSync(output, `# Carrossel ${itemSlug}\n\n\`\`\`json\n${JSON.stringify(descriptor, null, 2)}\n\`\`\`\n`, 'utf8'); return immutableCopy({ status: 'ready', output_path: output, descriptor }); }
function planCommercial({ module = 'COMMERCIAL_GENERAL', product_slug, existing_artifacts = [] }) { if (!product_slug) throw new TypeError('product_slug required'); if (module === 'COMMERCIAL_HT') return immutableCopy({ status: 'BLOCKED_EXTERNAL', dependency: 'ht-*', reason: 'c10x_skills_unavailable', resume_condition: 'install C10X plugin', existing_artifacts }); if (module !== 'COMMERCIAL_GENERAL') throw new TypeError('unknown commercial module'); return immutableCopy({ status: 'READY', module, outputs: ['playbook', 'funnel', 'launch-plan'], existing_artifacts }); }

module.exports = {
  PRODUCT_TYPES, DELIVERY_DIRECTORIES, listProducts, refreshPanelManifest, activateProduct, createProduct,
  MANUAL_COPY_PATH, REQUIRED_KNOWLEDGE_PATHS, COPY_WORKFLOWS, reviewCopy, getCopyOutputPath, saveReviewedCopy,
  LOW_TICKET_STEPS, LOW_TICKET_COMMANDS, createLowTicketPlan,
  MIDDLE_TICKET_STEPS, MIDDLE_TICKET_SOURCES, createMiddleTicketPlan,
  validatePageHtml, buildPage, createCarouselArtifact, createCarouselSchedule, planCommercial,
};
