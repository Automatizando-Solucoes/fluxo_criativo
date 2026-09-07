'use strict';

const { evaluateApproval } = require('../approvals/policy');
const { immutableCopy } = require('../contracts/immutable');

const VALID_STATUS = Object.freeze(['pending', 'running', 'completed', 'failed', 'blocked']);

function resolveRisk(workflow) {
  return { capabilities: workflow.capabilities, external: workflow.side_effects.external, financial: workflow.side_effects.financial, approval_required: workflow.approval.required, kind: workflow.kind, risk_from_children: workflow.risk_from_children };
}
function blocked(task, risk, reason, extra = {}) { return immutableCopy({ ...task, ...risk, ...extra, status: 'blocked', reason }); }
function approvalContext(task, workflow) {
  const supplied = task.approval_context || {};
  if (supplied.workflow_id && supplied.workflow_id !== workflow.id) return null;
  return { ...supplied, workflow_id: workflow.id, product: supplied.product === undefined ? (task.product || task.product_slug || null) : supplied.product, network: supplied.network === undefined ? (task.network || null) : supplied.network, action_type: supplied.action_type === undefined ? (task.action_type || null) : supplied.action_type, action_id: supplied.action_id === undefined ? (task.action_id || task.task_id) : supplied.action_id };
}
function validateTask(task, registry) {
  if (!task || !task.task_id || !task.workflow_id) throw new TypeError('typed task_id and workflow_id are required');
  if (task.command || task.shell || task.executable) throw new Error('arbitrary command execution is forbidden');
  let workflow;
  try { workflow = registry.get(task.workflow_id); } catch { return immutableCopy({ ...task, capabilities: [], external: false, financial: false, approval_required: false, kind: null, risk_from_children: false, approval_status: 'not_applicable', status: 'blocked', reason: 'unknown_workflow' }); }
  const risk = resolveRisk(workflow);
  if (workflow.kind === 'composite') {
    if (!workflow.risk_from_children) return blocked(task, risk, 'child_risk_unresolved', { approval_status: 'not_evaluated' });
    if (!Array.isArray(task.children) || task.children.length === 0) return blocked(task, risk, 'child_tasks_required', { approval_status: 'not_evaluated' });
    const children = task.children.map((child) => validateTask(child, registry));
    if (children.some((child) => child.status === 'blocked')) return blocked(task, risk, 'child_blocked', { approval_status: 'not_evaluated', children });
    return immutableCopy({ ...task, ...risk, children, approval_status: 'inherited_from_children', status: 'pending', reason: null });
  }
  if (!workflow.approval.required) return immutableCopy({ ...task, ...risk, approval_status: 'not_required', status: 'pending', reason: null });
  if (!task.approval_policy) return blocked(task, risk, 'approval_required', { approval_status: 'missing' });
  const context = approvalContext(task, workflow);
  if (!context) return blocked(task, risk, 'workflow_mismatch', { approval_status: 'workflow_mismatch' });
  let approval;
  try { approval = evaluateApproval(task.approval_policy, context); } catch { return blocked(task, risk, 'approval_policy_invalid', { approval_status: 'invalid' }); }
  if (!approval.allowed) return blocked(task, risk, approval.reason, { approval_status: approval.reason });
  if (workflow.side_effects.financial && task.approval_policy.mode !== 'manual') return blocked(task, risk, 'manual_approval_required', { approval_status: 'manual_approval_required' });
  return immutableCopy({ ...task, ...risk, approval_status: approval.reason, status: 'pending', reason: null });
}
function applyDependencyGates(tasks) {
  const byId = new Map(tasks.map((task) => [task.task_id, task]));
  return tasks.map((task) => {
    if (task.status === 'blocked' || !Array.isArray(task.depends_on)) return task;
    for (const dependencyId of task.depends_on) {
      const dependency = byId.get(dependencyId);
      if (!dependency) return immutableCopy({ ...task, status: 'blocked', reason: 'dependency_not_found' });
      if (dependency.status === 'blocked' || dependency.status === 'failed') return immutableCopy({ ...task, status: 'blocked', reason: 'dependency_blocked' });
    }
    return task;
  });
}
function resolvePlan(tasks, registry) {
  if (!Array.isArray(tasks)) throw new TypeError('tasks must be an array');
  const resolved = applyDependencyGates(tasks.map((task) => validateTask(task, registry)));
  return immutableCopy({ tasks: resolved, status: resolved.some((task) => task.status === 'blocked') ? 'blocked' : 'pending', dispatch: 'not_requested' });
}
module.exports = { VALID_STATUS, resolveRisk, approvalContext, validateTask, resolvePlan };
