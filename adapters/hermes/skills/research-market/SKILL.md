---
name: pesquisa-mercado
description: Planeja uma pesquisa de mercado a partir do contexto de produto.
version: 1.0.0
workflow_id: research.market
mode: dry_run
---

# Pesquisa de mercado (Hermes wrapper)

Leia e aplique `adapters/hermes/SOURCE-POLICY.md` antes de consultar qualquer fonte Claude.

1. Resolva `research.market` em `core/workflows/registry.js`.
2. Exija `product_slug` e o contexto metodológico disponível no produto.
3. Consulte `.claude/skills/pesquisa-mercado/SKILL.md` somente para os nove eixos: mercado, concorrentes, preço, público, objeções, ângulos, YouTube, anúncios e riscos.
4. Aceite findings já fornecidos/mockados para construir `pesquisa-mercado.md`; preserve artefato existente se uma source externa falhar.

`apify` e `ads_library` são somente providers allowlisted de `research.fetch`, com secrets lógicos `APIFY_API_TOKEN` e `META_ACCESS_TOKEN`. Nesta fase, não pesquise, não chame provider e retorne somente descriptor `dry_run`.
