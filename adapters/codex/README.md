# Adapter Codex

Codex resolve contratos pelo registry e usa somente `agents/` para metodologia e `core/` para negócio. Não executa commands Claude, providers, cron, delegates ou secrets reais.

`resolver.js` classifica os 26 workflows. `workflows.js` cobre boundaries
locais e de orchestration; `external-workflows.js` cobre pesquisa, criativos,
vídeo e dashboards em dry-run; `meta-workflows.js` cobre Meta e Ads report em
dry-run. Todos consomem `agents/` e `core/`, nunca adapters de Claude ou Hermes.
