---
name: toolkit-executar
description: Persiste e reavalia etapas tipadas do Toolkit dentro do produto.
version: 1.0.0
workflow_id: toolkit.execute
mode: local_orchestration
---

Leia `adapters/hermes/SOURCE-POLICY.md`. Use `agents/methodology/orchestration/plan-toolkit.md` somente como metodologia. O estado fica em `roteiro.md`, `plano.md` e `estado.md` no produto. O Toolkit resolve tasks pelo registry, preserva idempotência, dependências e gates de approval, mas não chama provider, cron, gateway ou delegate.
