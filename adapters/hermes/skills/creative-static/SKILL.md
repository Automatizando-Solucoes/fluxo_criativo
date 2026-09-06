---
name: criativo-estatico
description: Estrutura um briefing de criativo estático com contexto de produto.
version: 1.0.0
workflow_id: creative.static
mode: dry_run
---

# Criativo estático (Hermes wrapper)

Leia e aplique `adapters/hermes/SOURCE-POLICY.md` antes de consultar qualquer fonte Claude.

1. Resolva `creative.static` e exija `product_slug` e `brief`.
2. Consulte o perfil e a pesquisa locais quando existirem.
3. Use `.claude/commands/criativo-estatico.md` somente como fonte de compatibilidade.
4. Respeite capabilities e `ApprovalPolicy`.

`image.generate` é externo. Não gere imagem, não leia segredo e não acione provider. Retorne `external_capability_required` com `dry_run`.
