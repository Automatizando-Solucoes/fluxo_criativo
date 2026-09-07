# Relatório final de paridade Hermes

## Baseline e escopo

Baseline da Fase L: `main` em `88a26628cbfc87981d46bdad0bb7134038ee24e1`.

HEAD final: ponta de `refactor/hermes-workflow-completion`, registrada por `git log -1 --oneline` no encerramento da fase.

O registry possui 26 workflows. A distribuição final calculada da matriz é:

- `HERMES_READY`: 12.
- `HERMES_EXTERNAL_DRY_RUN`: 12.
- `HERMES_BLOCKED_EXTERNAL`: 1, `social.publish`.
- `HERMES_LEGACY`: 1, `traffic.insights` como alias de `ads.insights`.

## Contratos compartilhados e direção de dependências

Claude e Hermes convergem em `core/`: workflows locais, pesquisa, imagem, vídeo, dashboards, Meta Ads, Ads Report, Plan, Toolkit, publisher orgânico e diagnóstico High Ticket. Nenhum adapter Hermes importa adapter Claude e nenhum adapter Claude importa Hermes.

## Cobertura E2E

O teste `tests/hermes/claude-hermes-e2e-parity.test.js` executa as duas fixtures isoladas com os mesmos inputs e compara status, approval, risco, artifacts, paths relativos, dry-run, scheduling, idempotência, publisher e bloqueios C10X. Ele cobre as 26 decisões do registry.

Guards reais bloqueiam rede, HTTP/HTTPS, sockets, subprocessos e writes fora das fixtures. A execução validada mantém todos os contadores em zero. O scan final de resultados rejeita padrões de segredo; somente nomes lógicos são permitidos.

## Estados e limites

`HERMES_READY` significa paridade local ou de orquestração testada. `HERMES_EXTERNAL_DRY_RUN` significa contrato, metodologia e boundary de segurança completos com mock, mas sem provider live validado. `HERMES_BLOCKED_EXTERNAL` é fail-closed para dependências ou providers ausentes. `HERMES_LEGACY` é somente compatibilidade.

Não houve validação live de Meta, MCP, Apify, OpenRouter, Freepik, HeyGen, Replicate, UAZAPI ou publishers sociais. `social.publish` continua bloqueado sem adapter oficial. High Ticket/C10X continua bloqueado até que todas as skills `ht-*` existam; a presença delas somente altera a detecção de dependências, não habilita execução Hermes.
