---
name: copy-pagina
description: Orienta a criação de copy de página com contexto local do produto.
version: 1.0.0
workflow_id: copy.page
mode: dry_run
---

# Copy de página (Hermes wrapper)

Leia e aplique `adapters/hermes/SOURCE-POLICY.md` antes de consultar qualquer fonte Claude.

1. Resolva `copy.page` no registry e exija `product_slug` e `page_type`.
2. Use o produto ativo e leia somente os artefatos locais necessários: perfil, pesquisa e identidade do consumidor, quando existirem.
3. Consulte `.claude/commands/copy-pagina.md` como fonte de compatibilidade, `paginas` como `HERMES_WRAPPER`, e `revisora`/Manual da Copy como conhecimento nativo.
4. Respeite capabilities e `ApprovalPolicy` antes de qualquer escrita futura.

Este wrapper não executa command, script ou escrita nesta fase. Retorne apenas um plano local em `dry_run`.
