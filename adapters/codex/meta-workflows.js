'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');
const meta = require('../../core/external/meta-ads');
const report = require('../../core/external/ads-report');

const CODEX_META_WORKFLOWS = Object.freeze(['ads.insights', 'ads.campaign.create', 'ads.optimize', 'ads.scale', 'ads.report']);
function envelope(workflowId, result) { return immutableCopy({ workflow_id: workflowId, runtime: 'codex', support_status: 'CODEX_EXTERNAL_DRY_RUN', local_executable: true, external_executable: false, external: true, financial: Boolean(result.financial), approval_required: Boolean(result.approval_required), result }); }
function prepareCodexMetaOperation(input) { const result = meta.prepareMetaOperation(input); return envelope(input.workflow_id || result.operation, result); }
function prepareCodexMetaWorkflow(input) { if (!CODEX_META_WORKFLOWS.includes(input.workflow_id)) throw new TypeError(`unsupported Codex Meta workflow: ${input.workflow_id}`); return input.workflow_id === 'ads.report' ? envelope('ads.report', meta.prepareMetaOperation({ operation: 'ads.insights', auth_mode: input.auth_mode, secretProvider: input.secretProvider })) : prepareCodexMetaOperation({ ...input, operation: input.workflow_id }); }
function createCodexCampaignDraft(input) { return immutableCopy({ workflow_id: 'ads.campaign.create', runtime: 'codex', support_status: 'CODEX_EXTERNAL_DRY_RUN', local_executable: true, external_executable: false, draft: meta.createPausedCampaignDraft(input) }); }
function buildCodexAdsReport(input) { return immutableCopy({ workflow_id: 'ads.report', runtime: 'codex', support_status: 'CODEX_EXTERNAL_DRY_RUN', local_executable: true, external_executable: false, result: report.createAdsReport(input) }); }
function createCodexReportDelivery(input) { return report.createReportDelivery(input); }
module.exports = { CODEX_META_WORKFLOWS, prepareCodexMetaOperation, prepareCodexMetaWorkflow, createCodexCampaignDraft, buildCodexAdsReport, createCodexReportDelivery };
