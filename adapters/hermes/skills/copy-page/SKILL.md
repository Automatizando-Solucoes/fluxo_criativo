---
name: copy-page
workflow_id: copy.page
mode: dry_run
---

# Copy de página (Hermes wrapper)

1. Resolva `copy.page` no registry e exija `product_slug` e `page_type`.
2. Use o produto ativo e leia somente os artefatos locais necessários: perfil, pesquisa e identidade do consumidor, quando existirem.
3. Consulte `.claude/commands/copy-pagina.md` como fonte de compatibilidade, `paginas` como `HERMES_WRAPPER`, e `revisora`/Manual da Copy como conhecimento nativo.
4. Respeite capabilities e `ApprovalPolicy` antes de qualquer escrita futura.

Este wrapper não executa command, script ou escrita nesta fase. Retorne apenas um plano local em `dry_run`.
