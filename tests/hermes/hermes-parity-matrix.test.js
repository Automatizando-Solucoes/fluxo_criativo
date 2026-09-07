#!/usr/bin/env node

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const { workflowRegistry } = require('../../core/workflows/registry');
const { HERMES_SUPPORT_STATUSES, buildHermesParityMatrix } = require('../../adapters/hermes/parity');
const { WORKFLOW_ALIASES, resolveHermesWorkflow } = require('../../adapters/hermes/resolver');
const { getSkillCompatibility } = require('../../adapters/hermes/skill-compatibility');

const matrix = buildHermesParityMatrix();
const registryWorkflows = workflowRegistry.list();

assert.equal(matrix.length, registryWorkflows.length, 'every registry workflow must have a Hermes decision');
assert.equal(new Set(matrix.map((entry) => entry.workflow_id)).size, matrix.length, 'Hermes matrix IDs must be unique');

for (const entry of matrix) {
  assert.ok(HERMES_SUPPORT_STATUSES.includes(entry.hermes_current_support), `${entry.workflow_id} has an invalid current Hermes status`);
  assert.ok(HERMES_SUPPORT_STATUSES.includes(entry.hermes_target_support), `${entry.workflow_id} has an invalid target Hermes status`);
  if (entry.hermes_current_support === 'HERMES_READY') {
    assert.equal(entry.external, false, `${entry.workflow_id} cannot claim local Hermes parity with an external provider`);
  }
  assert.match(entry.hermes_current_support, /^HERMES_/, `${entry.workflow_id} must have an explicit Hermes classification`);
  assert.equal(/PARTIAL|UNKNOWN/.test(entry.hermes_current_support), false);
  assert.equal(fs.existsSync(path.join(root, entry.core_source.path)), true, `core source missing for ${entry.workflow_id}`);
  assert.equal(fs.existsSync(path.join(root, entry.methodology_source)), true, `methodology source missing for ${entry.workflow_id}`);
  if (entry.wrapper) {
    assert.equal(fs.existsSync(path.join(root, entry.wrapper)), true, `wrapper missing for ${entry.workflow_id}`);
  }
  if (entry.kind === 'composite') {
    assert.equal(entry.risk_from_children, true, `${entry.workflow_id} composite must preserve child risk`);
  }
  if (entry.financial) {
    assert.equal(entry.approval_required, true, `${entry.workflow_id} financial workflow requires approval`);
  }
}

const canonicalInsights = matrix.find((entry) => entry.workflow_id === 'ads.insights');
const compatibilityInsights = matrix.find((entry) => entry.workflow_id === 'traffic.insights');
assert.equal(canonicalInsights.hermes_current_support, 'HERMES_EXTERNAL_DRY_RUN');
assert.equal(compatibilityInsights.hermes_current_support, 'HERMES_LEGACY');
assert.deepEqual(WORKFLOW_ALIASES, { 'traffic.insights': 'ads.insights' });
assert.equal(resolveHermesWorkflow('traffic.insights').workflow_id, 'ads.insights');
assert.equal(resolveHermesWorkflow('traffic.insights').target.path, resolveHermesWorkflow('ads.insights').target.path);

assert.equal(matrix.find((entry) => entry.workflow_id === 'social.publish').hermes_current_support, 'HERMES_BLOCKED_EXTERNAL');
assert.equal(matrix.find((entry) => entry.workflow_id === 'social.publish').wrapper, 'adapters/hermes/skills/social-publish/SKILL.md');
assert.equal(matrix.find((entry) => entry.workflow_id === 'ads.scale').financial, true);
assert.equal(matrix.find((entry) => entry.workflow_id === 'ads.scale').approval_required, true);
for (const workflowId of ['ads.insights', 'ads.campaign.create', 'ads.optimize', 'ads.scale', 'ads.report']) {
  assert.equal(matrix.find((entry) => entry.workflow_id === workflowId).hermes_current_support, 'HERMES_EXTERNAL_DRY_RUN');
}
for (const workflowId of ['plan.execute', 'toolkit.execute']) {
  const entry = matrix.find((candidate) => candidate.workflow_id === workflowId);
  assert.equal(entry.hermes_current_support, 'HERMES_READY');
  assert.equal(entry.risk_from_children, true);
}
assert.equal(matrix.find((entry) => entry.workflow_id === 'carousel.schedule').hermes_current_support, 'HERMES_READY');

for (const workflowId of ['product.create', 'product.select', 'copy.page', 'copy.ad', 'copy.social', 'copy.script', 'page.sales', 'carousel.generate', 'commercial.playbook']) {
  assert.equal(matrix.find((entry) => entry.workflow_id === workflowId).hermes_current_support, 'HERMES_READY');
}
for (const workflowId of ['funnel.low_ticket', 'funnel.middle_ticket']) {
  assert.equal(matrix.find((entry) => entry.workflow_id === workflowId).hermes_current_support, 'HERMES_EXTERNAL_DRY_RUN');
}
for (const workflowId of ['research.market', 'image.generate', 'creative.static', 'video.generate', 'social.dashboard']) {
  assert.equal(matrix.find((entry) => entry.workflow_id === workflowId).hermes_current_support, 'HERMES_EXTERNAL_DRY_RUN');
}

for (const skillId of [
  'revisora', 'elementos-literarios', 'manual-copy', 'pesquisa-mercado', 'anuncios', 'paginas',
  'vtsd-completo', 'criacao-produto-low-ticket', 'carrossel',
  'video-avancado', 'instagram-dashboard', 'tiktok-dashboard', 'youtube-dashboard', 'linkedin-dashboard',
  'trafego-pago', 'trafego-insights', 'trafego-analise', 'trafego-criar-campanha', 'trafego-otimizar', 'trafego-escalar',
]) {
  const skill = getSkillCompatibility(skillId);
  assert.ok(skill.classification === 'HERMES_NATIVE' || skill.classification === 'HERMES_WRAPPER');
  assert.equal(fs.existsSync(path.join(root, skill.source)), true, `skill source missing: ${skillId}`);
}

const terminalStatuses = new Set(['HERMES_READY', 'HERMES_EXTERNAL_DRY_RUN', 'HERMES_BLOCKED_EXTERNAL', 'HERMES_LEGACY']);
for (const entry of matrix) {
  assert.equal(terminalStatuses.has(entry.hermes_current_support), true, `${entry.workflow_id} must not retain a transitional Hermes status`);
}
assert.equal(getSkillCompatibility('social-publish').classification, 'HERMES_BLOCKED_EXTERNAL');
assert.equal(getSkillCompatibility('estrategista-ht').classification, 'HERMES_BLOCKED_EXTERNAL');

process.stdout.write('Hermes parity matrix: ok\n');
