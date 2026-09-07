---
name: plano-executar
description: Resolve tarefas tipadas pelo registry sem executar comandos, providers ou filhos.
version: 1.0.0
workflow_id: plan.execute
mode: local_orchestration
---

Leia `adapters/hermes/SOURCE-POLICY.md`. Use `agents/methodology/orchestration/plan-toolkit.md` apenas como metodologia. Cada tarefa resolve pelo workflow registry, preserva capabilities, external, financial, approval e risco dos filhos. Shell, comandos arbitrários e dispatch automático são proibidos. Uma tarefa `pending` é apenas elegível; não foi executada.
