---
name: comercial-playbook
description: Estrutura o playbook comercial local e bloqueia somente o módulo C10X.
version: 1.0.0
workflow_id: commercial.playbook
mode: local
---

# Comercial Hermes

Leia e aplique `adapters/hermes/SOURCE-POLICY.md`. O módulo `COMMERCIAL_GENERAL` permanece local. `COMMERCIAL_HT` retorna `BLOCKED_EXTERNAL` para a dependência `ht-*` sem inventar C10X e sem apagar artefatos existentes.

Fonte metodológica de compatibilidade: `.claude/commands/comercial-playbook.md`.
