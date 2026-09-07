# Pesquisa de mercado no Claude Code

A skill `pesquisa-mercado` preserva os nove eixos metodológicos. O adapter `adapters/claude/market-research.js` não substitui a pesquisa: ele estabelece o contrato local para persistência, rastreabilidade, revisão e providers especializados.

## Modos de fonte

- **Claude Web:** WebSearch/WebFetch públicos podem ser usados para pesquisa. Não exigem `SecretProvider`.
- **Provider especializado:** Apify e qualquer fonte autenticada passam por `SecretProvider`. O modelo só conhece nome lógico, referência e disponibilidade, nunca o valor. Nesta fase o adapter retorna somente descriptor `dry_run`.

## Artefato e falha

O relatório é salvo em `meus-produtos/{slug}/pesquisa-mercado.md` somente após validar os nove eixos e cada achado como `FATO` ou `INFERÊNCIA`, com fonte e data. A saída inclui descriptor para `revisor-pesquisa`; o adapter não chama agente automaticamente.

Se uma fonte falhar, o resultado é `source_failed` e uma pesquisa existente é preservada. Não há leitura de `.env`, `op`, rede ou token no adapter/teste.
