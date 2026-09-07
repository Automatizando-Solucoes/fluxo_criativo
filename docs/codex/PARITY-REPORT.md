# Relatório de paridade Codex

O Codex usa `AGENTS.md` como entrypoint, `agents/` como metodologia e política
canônicas, `core/` como contrato de negócio e `adapters/codex/` como glue fino.
Não executa commands Claude diretamente e não importa adapters Claude ou
Hermes.

O registry possui 26 workflows. A matriz Codex calcula sua classificação a
partir do registry: workflows locais/orquestração são `CODEX_READY`, boundaries
externos são `CODEX_EXTERNAL_DRY_RUN`, `social.publish` é
`CODEX_BLOCKED_EXTERNAL` e `traffic.insights` é `CODEX_LEGACY` que resolve para
`ads.insights`.

`CODEX_EXTERNAL_DRY_RUN` significa contrato, metodologia e boundary seguro
prontos, sem validação live de provider. O runtime não acessa rede, vault,
MCP, cron, delegates, gateway, publisher, deploy ou provider nesta paridade.
