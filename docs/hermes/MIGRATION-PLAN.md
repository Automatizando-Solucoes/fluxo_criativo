# Plano de migração Hermes

## Baseline e paridade

Baseline: `main` em `88a26628cbfc87981d46bdad0bb7134038ee24e1`. Claude Code é o runtime funcional de referência. A matriz em [PARITY-MATRIX.md](PARITY-MATRIX.md) decide cada workflow do registry antes de qualquer implementação Hermes.

Um workflow será `HERMES_READY` somente quando resolver pelo registry, tiver wrapper ou skill nativa, preservar entradas, saídas e metodologia Claude, usar `meus-produtos/{slug}/`, respeitar ApprovalPolicy, não expor segredo, tipar fronteira externa e possuir teste Hermes local. `HERMES_EXTERNAL_DRY_RUN` significa contrato, segurança, adapter e mock prontos, mas sem provider live validado.

## Lotes

- **L2, locais: concluída.** Produto, copy local, Low/Middle Ticket, página, carrossel e comercial usam o mesmo boundary local do Claude. Low/Middle Ticket persistem somente handoff Meta manual em dry-run, sem provider.
- **L3, criativos e pesquisa: concluída.** Pesquisa, imagem, criativo estático, vídeo e dashboards usam boundaries compartilhados, SecretProvider mock e artifacts/cache locais. Todos providers continuam em mock/dry-run.
- **L4, Meta Ads: concluída.** Insights canônico e alias, criação, otimização, escala e relatório usam o mesmo boundary Meta e ReportResult do Claude. APP/MCP só alteram o transporte; `PAUSED`, approval manual e grant financeiro exato continuam obrigatórios. Nenhum provider foi executado.
- **L5, orquestração: concluída.** Plan Executor e Toolkit compartilham contracts de tarefas tipadas, risco dos filhos, ApprovalPolicy, dependências, retry e idempotência. Scheduling de carrossel persiste somente descriptor local; o cron Hermes continua `scheduled:false` e dry-run.
- **L6, bloqueados/publisher: concluída.** `social.publish` possui wrapper para criar e avaliar request, mas permanece `HERMES_BLOCKED_EXTERNAL` até adapter oficial por plataforma. C10X/High Ticket compartilha apenas detecção de dependência; ausência de `ht-*` preserva artefatos e bloqueia sem inventar execução.
- **L7, paridade E2E: concluída.** Duas fixtures isoladas com os mesmos inputs comparam contratos de negócio, gates, artifacts e bloqueios de todos os workflows do registry. Guards reais bloqueiam rede, subprocesso e writes fora da fixture.

## Fase L concluída

A Fase L terminou com 26 decisões Hermes terminais no registry. A paridade é contratual: workflows locais e de orquestração estão testados como `HERMES_READY`; boundaries externos continuam `HERMES_EXTERNAL_DRY_RUN`; publisher e C10X falham fechados como `HERMES_BLOCKED_EXTERNAL`; `traffic.insights` continua alias `HERMES_LEGACY` de `ads.insights`.

## Regras externas

Providers, 1Password, MCP e cron Hermes permanecem dry-run. `manual`, `standing` e `disabled` são avaliados pelo contrato core; financeiro exige manual. Delegates não recebem secrets, capacidades externas, publicação, gasto ou deploy.

Gateway Hermes é canal de conversa/delivery do agente. `notification.send` e UAZAPI são integrações de negócio distintas e não devem ser substituídos pelo gateway.
