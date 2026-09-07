# Matriz de paridade Hermes

Baseline: `main` em `88a26628cbfc87981d46bdad0bb7134038ee24e1`. Claude Code é a referência funcional. A Fase L está concluída: esta matriz cobre todos os workflows do registry e descreve resolução, wrapper e gates dry-run, sem habilitar providers, cron, delegates ou publicação. O teste `claude-hermes-e2e-parity.test.js` compara as duas fixtures isoladas.

| Workflow | Categoria | Core source | Ext. | Financ. | Approval | Kind / child risk | Claude | Hermes atual → alvo | Wrapper | Metodologia | Capability | Secret lógico | Estratégia | Lote | Nota |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `product.create` | product | claude adapter | não | não | não | atomic / não | READY | HERMES_READY | `product-create` | `produto-novo` | filesystem | — | não requerida | L2 concluída | Estado em `meus-produtos`. |
| `product.select` | product | claude adapter | não | não | não | atomic / não | READY | HERMES_READY | `product-select` | `produto-trocar` | filesystem | — | não requerida | L2 concluída | Atualiza somente ativo local. |
| `research.market` | research | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `research-market` | `pesquisa-mercado` | `research.fetch` | `APIFY_API_TOKEN`/`META_ACCESS_TOKEN` | standing ou manual | L3 concluída | Nove eixos, artifact local e preservação em erro; provider dry-run. |
| `copy.page` | copy | claude command | não | não | não | atomic / não | READY | HERMES_READY | `copy-page` | `paginas` | filesystem | — | não requerida | L2 concluída | Gate comum e artefato local. |
| `copy.ad` | copy | claude command | não | não | não | atomic / não | READY | HERMES_READY | `copy-ad` | `anuncios` | filesystem | — | não requerida | L2 concluída | Texto local, sem campanha. |
| `copy.social` | copy | claude command | não | não | não | atomic / não | READY | HERMES_READY | `copy-social` | `revisora` | filesystem | — | não requerida | L2 concluída | `autopublish:false`. |
| `copy.script` | copy | claude command | não | não | não | atomic / não | READY | HERMES_READY | `copy-script` | `copy-roteiro` | filesystem | — | não requerida | L2 concluída | Gate comum e roteiro local. |
| `funnel.low_ticket` | funnel | claude adapter | sim | não | sim | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `funnel-low-ticket` | `lt-funil` | `ads.write` | `META_ACCESS_TOKEN` | manual | L2 concluída | Plano local; handoff Meta manual/PAUSED dry-run. |
| `funnel.middle_ticket` | funnel | claude adapter | sim | não | sim | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `funnel-middle-ticket` | estrategista MT | `ads.write` | `META_ACCESS_TOKEN` | manual | L2 concluída | Plano local; handoff Meta manual dry-run. |
| `page.sales` | page | claude adapter | não | não | não | atomic / não | READY | HERMES_READY | `page-sales` | `paginas` | filesystem | — | não requerida | L2 concluída | Deploy não faz parte da paridade. |
| `carousel.generate` | content | claude adapter | não | não | não | atomic / não | READY | HERMES_READY | `carousel-generate` | `carrossel` | filesystem | — | não requerida | L2 concluída | Geração não é publicação. |
| `carousel.schedule` | scheduling | claude adapter | não | não | não | atomic / não | READY | HERMES_READY | `carousel-schedule` | `programar-carrossel-noticia` | scheduler | — | standing ou manual | L5 concluída | Descriptor local; `publication:false` e `scheduled:false`. |
| `image.generate` | creative | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `image-generate` | `criativo-estatico` | `image.generate` | `OPENROUTER_API_KEY`/`FREEPIK_API_KEY` | gate de provider | L3 concluída | Allowlist e mock artifact local. |
| `creative.static` | creative | claude command | sim | não | não | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `creative-static` | `criativo-estatico` | `image.generate` | provider lógico | gate de provider | L3 concluída | Brief/prompt local; geração separada e dry-run. |
| `video.generate` | creative | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `video-generate` | `video-heygen` | `video.generate` | `HEYGEN_API_KEY`/`REPLICATE_API_TOKEN` | gate de provider | L3 concluída | Plano ou mock local; nenhum renderer executado. |
| `ads.insights` | traffic | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `traffic-insights` | `trafego-insights` | `ads.insights` | `META_ACCESS_TOKEN` no APP | read policy | L4 concluída | ID canônico; APP/MCP são transports dry-run. |
| `traffic.insights` | traffic | claude command | sim | não | não | atomic / não | LEGACY | HERMES_LEGACY | `traffic-insights` | `trafego-insights` | `ads.insights` | `META_ACCESS_TOKEN` no APP | read policy | L4 concluída | Alias que resolve para `ads.insights`, sem segunda implementação. |
| `ads.campaign.create` | traffic | claude adapter | sim | não | sim | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `ads-campaign-create` | `trafego-criar-campanha` | `ads.write` | `META_ACCESS_TOKEN` no APP | manual | L4 concluída | Descriptor compartilhado; campanha sempre `PAUSED`. |
| `ads.optimize` | traffic | claude adapter | sim | não | sim | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `ads-optimize` | `trafego-otimizar` | `ads.write` | `META_ACCESS_TOKEN` no APP | manual | L4 concluída | Diagnóstico é local; orçamento só usa `ads.scale`. |
| `ads.scale` | traffic | claude adapter | sim | sim | sim | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `ads-scale` | `trafego-escalar` | `ads.financial_write` | `META_ACCESS_TOKEN` no APP | grant manual por ação | L4 concluída | Financeiro fail-closed; standing é bloqueado. |
| `ads.report` | traffic | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `ads-report` | `ads-relatorio` | `ads.insights` | `META_ACCESS_TOKEN` no APP | read policy | L4 concluída | ReportResult compartilhado e separado de delivery. |
| `social.dashboard` | social | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | HERMES_EXTERNAL_DRY_RUN | `social-dashboard` | `dados-instagram` | `research.fetch` | `APIFY_API_TOKEN` | standing ou manual | L3 concluída | Cache mock por plataforma, preservado em erro. |
| `social.publish` | social | claude adapter | sim | não | sim | atomic / não | BLOCKED_EXTERNAL | HERMES_BLOCKED_EXTERNAL | `social-publish` | `copy-social` | `publisher.publish` | — | manual ou standing escopada | L6 concluída | Request local e handoff manual; adapter oficial ausente mantém `autopublish` bloqueado. |
| `plan.execute` | orchestration | claude adapter | não | não | não | composite / sim | READY | HERMES_READY | `plan-execute` | executor de plano | capabilities dos filhos | — | policy dos filhos | L5 concluída | Resolve filhos e risco; dispatch não é automático. |
| `toolkit.execute` | toolkit | claude adapter | não | não | não | composite / sim | READY | HERMES_READY | `toolkit-execute` | `toolkit-executar` | capabilities dos filhos | — | policy dos filhos | L5 concluída | Estado no produto, idempotência e reavaliação sem executar filhos. |
| `commercial.playbook` | commercial | claude adapter | não | não | não | atomic / não | READY | HERMES_READY | `commercial-playbook` | `comercial-playbook` | filesystem | — | não requerida | L2 concluída | COMMERCIAL_GENERAL pronto; COMMERCIAL_HT continua C10X bloqueado. |

## Alias de insights

`ads.insights` é a intenção canônica. `traffic.insights` é compatibilidade histórica e o resolver Hermes a redireciona explicitamente para `ads.insights` e para o mesmo wrapper `traffic-insights`. Não há duas implementações Hermes para a mesma leitura de Ads.

## Significado dos estados finais

- `HERMES_READY`: paridade local ou de orquestração completa e testada. Não implica provider live.
- `HERMES_EXTERNAL_DRY_RUN`: contrato, metodologia, security boundary e mock/dry-run completos. Provider live não é validado.
- `HERMES_BLOCKED_EXTERNAL`: dependência externa indisponível.
- `HERMES_LEGACY`: superfície de compatibilidade explícita, não implementação própria.

Estados transitórios (`HERMES_WRAPPER_REQUIRED`, `HERMES_NATIVE_CANDIDATE` e `HERMES_COMPOSITE_REQUIRED`) não permanecem na matriz final.
