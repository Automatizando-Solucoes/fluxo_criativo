#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { workflowRegistry } = require('../../core/workflows/registry');
const { INTEGRATION_CAPABILITIES } = require('../../core/integrations/contracts');

const root = path.resolve(__dirname, '../..');
const workflows = workflowRegistry.list();
const ids = workflows.map((workflow) => workflow.id);
const expected = [
  'product.create', 'product.select', 'research.market', 'copy.page', 'copy.ad', 'copy.social', 'copy.script',
  'funnel.low_ticket', 'funnel.middle_ticket', 'page.sales', 'carousel.generate', 'carousel.schedule',
  'image.generate', 'video.generate', 'ads.insights', 'ads.campaign.create', 'ads.optimize', 'ads.scale', 'ads.report',
  'social.dashboard', 'social.publish', 'plan.execute', 'toolkit.execute', 'commercial.playbook',
];

assert.equal(new Set(ids).size, ids.length, 'workflow IDs must be unique');
for (const id of expected) assert.equal(workflowRegistry.has(id), true, `missing completed workflow: ${id}`);
for (const id of ['meta-conexao', 'gerar-token-facebook-ads', 'configurar-uazapi', 'ht-c10x']) {
  assert.equal(workflowRegistry.has(id), false, `alias, configurator or unavailable dependency must not be a workflow: ${id}`);
}
for (const workflow of workflows) {
  assert.equal(fs.existsSync(path.join(root, workflow.source.path)), true, `${workflow.id} source must exist`);
  if (workflow.capabilities.some((capability) => INTEGRATION_CAPABILITIES.includes(capability))) {
    assert.equal(workflow.side_effects.external, true, `${workflow.id} external capability must declare external side effect`);
  }
  if (workflow.side_effects.financial) assert.equal(workflow.approval.required, true, `${workflow.id} financial workflow must require approval`);
  if (workflow.kind === 'composite') assert.equal(workflow.risk_from_children, true, `${workflow.id} composite must inherit child risk`);
}
assert.equal(workflowRegistry.get('ads.scale').side_effects.financial, true);
assert.equal(workflowRegistry.get('ads.scale').approval.required, true);
assert.equal(workflowRegistry.get('ads.campaign.create').approval.required, true);
assert.equal(workflowRegistry.get('social.publish').side_effects.external, true);
assert.equal(workflowRegistry.get('social.publish').approval.required, true);
assert.equal(workflowRegistry.get('social.publish').capabilities.includes('publisher.publish'), true);
assert.equal(workflowRegistry.get('plan.execute').risk_from_children, true);
assert.equal(workflowRegistry.get('toolkit.execute').risk_from_children, true);

process.stdout.write(`workflow registry completion: ok (${ids.length} workflows)\n`);
