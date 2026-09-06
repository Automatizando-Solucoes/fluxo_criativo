'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { immutableCopy } = require('../../core/contracts/immutable');
const { assertProductSlug, getProductPath } = require('../../core/state/product-state');

const MANUAL_COPY_PATH = '.claude/skills/revisora/references/manual-copy.md';
const REQUIRED_KNOWLEDGE_PATHS = Object.freeze([
  MANUAL_COPY_PATH,
  '.claude/skills/elementos-literarios/SKILL.md',
  '.claude/skills/revisora/SKILL.md',
]);
const COPY_WORKFLOWS = Object.freeze({
  'copy.page': Object.freeze({ command: 'copy-pagina', output: (slug) => `entregas/copy-pagina/copy-${slug}.md`, requires_page_blocks: true }),
  'copy.ad': Object.freeze({ command: 'copy-anuncio', output: (slug) => `entregas/criativos/anuncios-${slug}.md` }),
  'copy.social': Object.freeze({ command: 'copy-social', output: (slug) => `entregas/conteudo-social/copy-social-${slug}.md` }),
  'copy.script': Object.freeze({ command: 'copy-roteiro', output: (slug) => `entregas/criativos/roteiro-${slug}.md` }),
  'copy.post_variation': Object.freeze({ command: 'copy-variacao-post', output: (slug) => `entregas/conteudo-social/variacoes-post-${slug}.md` }),
});

const FORBIDDEN_PATTERNS = Object.freeze([
  Object.freeze({ code: 'em_dash', pattern: /—/u }),
  Object.freeze({ code: 'exclamation', pattern: /!/u }),
  Object.freeze({ code: 'not_x_is_y', pattern: /(?:^|\s)não\s+(?:é|foi|era|são|eram)(?:\s|$)[^.\n]{0,100}\.\s*(?:é|foi|era|são|eram)(?:\s|$)/iu }),
  Object.freeze({ code: 'sem_precisar', pattern: /\bsem precisar\b/iu }),
  Object.freeze({ code: 'mesmo_que', pattern: /\bmesmo que\b/iu }),
  Object.freeze({ code: 'missing_ptbr_accent', pattern: /\b(?:nao|voce|tambem|estrategia|pagina|video)\b/iu }),
]);

function assertWorkflowId(workflowId) {
  if (!Object.hasOwn(COPY_WORKFLOWS, workflowId)) throw new TypeError(`unsupported copy workflow: ${workflowId}`);
  return workflowId;
}

function assertContent(content) {
  if (typeof content !== 'string' || content.trim().length === 0) throw new TypeError('copy content must be a non-empty string');
  return content;
}

function reviewCopy({ workflow_id, content }) {
  const workflowId = assertWorkflowId(workflow_id);
  const text = assertContent(content);
  const issues = [];
  for (const rule of FORBIDDEN_PATTERNS) {
    if (rule.pattern.test(text)) issues.push(rule.code);
    rule.pattern.lastIndex = 0;
  }
  if (COPY_WORKFLOWS[workflowId].requires_page_blocks) {
    for (let index = 1; index <= 16; index += 1) {
      const block = `## Bloco ${String(index).padStart(2, '0')}`;
      if (!text.includes(block)) issues.push(`missing_${block.replaceAll(' ', '_').toLowerCase()}`);
    }
  }
  return immutableCopy({
    status: issues.length === 0 ? 'passed' : 'blocked',
    workflow_id: workflowId,
    issues,
    required_knowledge: REQUIRED_KNOWLEDGE_PATHS,
    reviewer: 'revisora',
  });
}

function getCopyOutputPath({ projectRoot, product_slug, workflow_id }) {
  const slug = assertProductSlug(product_slug);
  const workflowId = assertWorkflowId(workflow_id);
  return path.join(getProductPath(slug, projectRoot), COPY_WORKFLOWS[workflowId].output(slug));
}

function saveReviewedCopy({ projectRoot, product_slug, workflow_id, content, review }) {
  const text = assertContent(content);
  const expected = reviewCopy({ workflow_id, content: text });
  if (!review || review.status !== 'passed' || expected.status !== 'passed') {
    throw new Error('copy must pass the common review gate before it is saved');
  }
  const outputPath = getCopyOutputPath({ projectRoot, product_slug, workflow_id });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, text, 'utf8');
  return immutableCopy({ status: 'saved', workflow_id, output_path: outputPath, review: expected });
}

module.exports = {
  MANUAL_COPY_PATH,
  REQUIRED_KNOWLEDGE_PATHS,
  COPY_WORKFLOWS,
  reviewCopy,
  getCopyOutputPath,
  saveReviewedCopy,
};
