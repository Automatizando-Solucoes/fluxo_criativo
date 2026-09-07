# Matriz de paridade Hermes

Baseline: `main` em `88a26628cbfc87981d46bdad0bb7134038ee24e1`. Claude Code é a referência funcional. Esta matriz cobre todos os workflows do registry e descreve somente resolução, wrapper e gates dry-run: ela não habilita providers, cron, delegates ou publicação.

| Workflow | Categoria | Core source | Ext. | Financ. | Approval | Kind / child risk | Claude | Hermes atual → alvo | Wrapper | Metodologia | Capability | Secret lógico | Estratégia | Lote | Nota |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `product.create` | product | claude adapter | não | não | não | atomic / não | READY | NATIVE_CANDIDATE → READY | — | `produto-novo` | filesystem | — | não requerida | L2 | Estado em `meus-produtos`. |
| `product.select` | product | claude adapter | não | não | não | atomic / não | READY | NATIVE_CANDIDATE → READY | — | `produto-trocar` | filesystem | — | não requerida | L2 | Atualiza somente ativo local. |
| `research.market` | research | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | EXTERNAL_DRY_RUN → EXTERNAL_DRY_RUN | `research-market` | `pesquisa-mercado` | `research.fetch` | `APIFY_API_TOKEN` | standing ou manual | L3 | Provider continua dry-run. |
| `copy.page` | copy | claude command | não | não | não | atomic / não | READY | WRAPPER_REQUIRED → READY | `copy-page` | `paginas` | filesystem | — | não requerida | L2 | Wrapper ainda não grava artefato Hermes. |
| `copy.ad` | copy | claude command | não | não | não | atomic / não | READY | WRAPPER_REQUIRED → READY | `copy-ad` | `anuncios` | filesystem | — | não requerida | L2 | Wrapper ainda não gera saída. |
| `copy.social` | copy | claude command | não | não | não | atomic / não | READY | WRAPPER_REQUIRED → READY | `copy-social` | `revisora` | filesystem | — | não requerida | L2 | Não autoriza publicação. |
| `copy.script` | copy | claude command | não | não | não | atomic / não | READY | NATIVE_CANDIDATE → READY | — | `copy-roteiro` | filesystem | — | não requerida | L2 | Requer wrapper e revisão compartilhada. |
| `funnel.low_ticket` | funnel | claude adapter | sim | não | sim | atomic / não | READY_EXTERNAL | WRAPPER_REQUIRED → EXTERNAL_DRY_RUN | — | `lt-funil` | `ads.write` | `META_ACCESS_TOKEN` | manual | L2 | Plano e handoff Meta separados. |
| `funnel.middle_ticket` | funnel | claude adapter | sim | não | sim | atomic / não | READY_EXTERNAL | WRAPPER_REQUIRED → EXTERNAL_DRY_RUN | — | estrategista MT | `ads.write` | `META_ACCESS_TOKEN` | manual | L2 | Plano 8D local; handoff seco. |
| `page.sales` | page | claude adapter | não | não | não | atomic / não | READY | NATIVE_CANDIDATE → READY | — | `paginas` | filesystem | — | não requerida | L2 | Deploy não faz parte da paridade. |
| `carousel.generate` | content | claude adapter | não | não | não | atomic / não | READY | NATIVE_CANDIDATE → READY | — | `carrossel` | filesystem | — | não requerida | L2 | Geração não é publicação. |
| `carousel.schedule` | scheduling | claude adapter | não | não | não | atomic / não | READY | WRAPPER_REQUIRED → READY | — | `programar-carrossel-noticia` | scheduler | — | standing ou manual | L5 | Apenas descriptor; `scheduled:false`. |
| `image.generate` | creative | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | WRAPPER_REQUIRED → EXTERNAL_DRY_RUN | — | `criativo-estatico` | `image.generate` | provider lógico | gate de provider | L3 | Reutiliza boundary de imagem. |
| `creative.static` | creative | claude command | sim | não | não | atomic / não | READY_EXTERNAL | EXTERNAL_DRY_RUN → EXTERNAL_DRY_RUN | `creative-static` | `criativo-estatico` | `image.generate` | provider lógico | gate de provider | L3 | ID estável, sem provider live. |
| `video.generate` | creative | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | WRAPPER_REQUIRED → EXTERNAL_DRY_RUN | — | `video-heygen` | `video.generate` | HeyGen/Replicate | gate de provider | L3 | Local e externo continuam distintos. |
| `ads.insights` | traffic | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | EXTERNAL_DRY_RUN → EXTERNAL_DRY_RUN | `traffic-insights` | `trafego-insights` | `ads.insights` | `META_ACCESS_TOKEN` | read policy | L4 | ID canônico; APP/MCP são transports. |
| `traffic.insights` | traffic | claude command | sim | não | não | atomic / não | LEGACY | LEGACY → EXTERNAL_DRY_RUN | `traffic-insights` | `trafego-insights` | `ads.insights` | `META_ACCESS_TOKEN` | read policy | L4 | Alias que resolve para `ads.insights`. |
| `ads.campaign.create` | traffic | claude adapter | sim | não | sim | atomic / não | READY_EXTERNAL | WRAPPER_REQUIRED → EXTERNAL_DRY_RUN | — | `trafego-criar-campanha` | `ads.write` | `META_ACCESS_TOKEN` | manual | L4 | Sempre `PAUSED`. |
| `ads.optimize` | traffic | claude adapter | sim | não | sim | atomic / não | READY_EXTERNAL | WRAPPER_REQUIRED → EXTERNAL_DRY_RUN | — | `trafego-otimizar` | `ads.write` | `META_ACCESS_TOKEN` | manual | L4 | Diagnóstico e alteração são separados. |
| `ads.scale` | traffic | claude adapter | sim | sim | sim | atomic / não | READY_EXTERNAL | WRAPPER_REQUIRED → EXTERNAL_DRY_RUN | — | `trafego-escalar` | `ads.financial_write` | `META_ACCESS_TOKEN` | grant manual por ação | L4 | Financeiro, fail-closed. |
| `ads.report` | traffic | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | WRAPPER_REQUIRED → EXTERNAL_DRY_RUN | — | `ads-relatorio` | `ads.insights` | `META_ACCESS_TOKEN` | read policy | L4 | Report separado de delivery. |
| `social.dashboard` | social | claude adapter | sim | não | não | atomic / não | READY_EXTERNAL | WRAPPER_REQUIRED → EXTERNAL_DRY_RUN | — | `dados-instagram` | `research.fetch` | `APIFY_API_TOKEN` | standing ou manual | L3 | Provider e cache mockados. |
| `social.publish` | social | claude adapter | sim | não | sim | atomic / não | BLOCKED_EXTERNAL | BLOCKED_EXTERNAL → BLOCKED_EXTERNAL | — | `copy-social` | `publisher.publish` | provider da plataforma | manual ou standing escopada | L6 | Sem adapter oficial; `autopublish:false`. |
| `plan.execute` | orchestration | claude adapter | não | não | não | composite / sim | READY | COMPOSITE_REQUIRED → COMPOSITE_REQUIRED | — | executor de plano | capabilities dos filhos | — | policy dos filhos | L5 | Resolve filhos antes de dispatch. |
| `toolkit.execute` | toolkit | claude adapter | não | não | não | composite / sim | READY | COMPOSITE_REQUIRED → COMPOSITE_REQUIRED | — | `toolkit-executar` | capabilities dos filhos | — | policy dos filhos | L5 | Estado persistente e idempotência. |
| `commercial.playbook` | commercial | claude adapter | não | não | não | atomic / não | READY | NATIVE_CANDIDATE → READY | — | `comercial-playbook` | filesystem | — | não requerida | L2 | Módulo HT continua C10X bloqueado. |

## Alias de insights

`ads.insights` é a intenção canônica. `traffic.insights` é compatibilidade histórica e o resolver Hermes a redireciona explicitamente para `ads.insights` e para o mesmo wrapper `traffic-insights`. Não há duas implementações Hermes para a mesma leitura de Ads.

## Significado dos estados

- `HERMES_READY`: paridade testada, sem provider live em teste.
- `HERMES_WRAPPER_REQUIRED`: ainda precisa de wrapper com entrada e saída equivalentes.
- `HERMES_NATIVE_CANDIDATE`: metodologia/localidade permite avaliação para wrapper nativo no lote indicado.
- `HERMES_EXTERNAL_DRY_RUN`: contrato, segurança e mock/dry-run são alvo ou cobertura atual; provider live não é validado.
- `HERMES_BLOCKED_EXTERNAL`: dependência externa indisponível.
- `HERMES_COMPOSITE_REQUIRED`: risco e approval precisam ser resolvidos por filho.
- `HERMES_LEGACY`: superfície de compatibilidade explícita, não implementação própria.
