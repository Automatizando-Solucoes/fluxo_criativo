---
name: research-market
workflow_id: research.market
mode: dry_run
---

# Pesquisa de mercado (Hermes wrapper)

1. Resolva `research.market` em `core/workflows/registry.js`.
2. Exija `product_slug` e o contexto metodológico disponível no produto.
3. Consulte a fonte de compatibilidade `.claude/skills/pesquisa-mercado/SKILL.md` e a classificação `HERMES_WRAPPER`.
4. Respeite as capabilities declaradas e a `ApprovalPolicy` aplicável.

`research.fetch` é uma capability externa. Nesta fase, não pesquise, não chame provider e retorne `external_capability_required` com `dry_run`.
