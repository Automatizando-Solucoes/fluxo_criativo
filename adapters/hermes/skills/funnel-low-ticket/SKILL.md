---
name: lt-funil
description: Gera plano Low Ticket local com handoff de tráfego em dry-run.
version: 1.0.0
workflow_id: funnel.low_ticket
mode: local_with_external_dry_run
---

# Funil Low Ticket Hermes

Leia e aplique `adapters/hermes/SOURCE-POLICY.md`. Exija pesquisa, perfil e identidade do consumidor. Gere o plano local e persista o handoff Meta apenas como descriptor `dry_run`, `manual` e `PAUSED`. Não cria campanha, não chama Meta e não lê secrets.

Fonte metodológica de compatibilidade: `.claude/commands/lt-funil.md`.
