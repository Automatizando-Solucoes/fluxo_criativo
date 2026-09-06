---
name: copy-social
description: Orienta a criação de copy social com metodologia de copy local.
version: 1.0.0
workflow_id: copy.social
mode: dry_run
---

# Copy social (Hermes wrapper)

Leia e aplique `adapters/hermes/SOURCE-POLICY.md` antes de consultar qualquer fonte Claude.

1. Resolva `copy.social` e exija `product_slug` e `platform`.
2. Use somente perfil, pesquisa e identidade do consumidor locais quando existirem.
3. Consulte `.claude/commands/copy-social.md`, `elementos-literarios`, `revisora` e Manual da Copy por referência.
4. Respeite capabilities e `ApprovalPolicy`.

O wrapper não publica, não notifica e não chama integração. Nesta fase ele produz somente orientação local em `dry_run`.
