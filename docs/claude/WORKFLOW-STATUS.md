# Status funcional do runtime Claude

Data: 2026-09-07. O estado de negócio permanece em `meus-produtos/{slug}/`; os testes usam fixtures temporárias e não executam rede, vault, publish, cron, deploy ou gasto.

## Produto

| Workflow | Status | Evidência |
| --- | --- | --- |
| Produto | READY | Criação, seleção, `.ativo`, slug e writes confinados são cobertos por `product-vtsd-workflow.test.js`. |
| VTSD | READY | Perfil, consumidor, pesquisa e entregas persistem no produto. |
| Pesquisa | READY_EXTERNAL | Pesquisa pública é suportada; provider especializado usa boundary e mock. |
| Revisores | READY | Pesquisa, perfil, consumidor e copy possuem gates locais de revisão. |

## Copy

| Workflow | Status | Evidência |
| --- | --- | --- |
| Página | READY | Contrato de blocos, Manual da Copy e revisora geram artefato local. |
| Anúncio | READY | Copy e revisão são locais; mídia é workflow separado. |
| Social | READY | Conteúdo revisado é persistido no produto, sem publicação. |
| Roteiro | READY | Fonte compatível e contrato de copy registram saída local. |

## Funis

| Workflow | Status | Evidência |
| --- | --- | --- |
| Low Ticket | READY_EXTERNAL | Plano completo é local; handoff Meta permanece dry-run e manual. |
| Middle Ticket | READY_EXTERNAL | Plano 8D e artefatos são locais; handoff externo é dry-run. |
| High Ticket | BLOCKED_EXTERNAL | Dependência: `ht-*`/C10X ausente. Retomar ao instalar o plugin; dados existentes são preservados. |

## Conteúdo

| Workflow | Status | Evidência |
| --- | --- | --- |
| Page build | READY | HTML validado, assets relativos e deploy manual. |
| Carousel generation | READY | Pauta, slides, CTA, prompts e artefato local com `autopublish:false`. |
| Carousel scheduling | READY | Descriptor dry-run persiste `schedule_id` próprio; não publica e não usa `RELATORIO_CRON_ID`. |
| Image | READY_EXTERNAL | OpenRouter/Freepik são allowlisted e mockados. |
| Video | READY_EXTERNAL | Render local é plano dry-run; HeyGen/Replicate usam adapter/mock. |

## Ads

| Workflow | Status | Evidência |
| --- | --- | --- |
| Connection | READY_EXTERNAL | `META_AUTH_MODO` separa MCP OAuth de APP via SecretProvider; conexão não concede escrita. |
| Insights | READY_EXTERNAL | `ads.insights` é READ e mockado. |
| Analysis | READY | Consome insights normalizados sem autenticação própria. |
| Create campaign | READY_EXTERNAL | WRITE manual; draft sempre `PAUSED`. |
| Optimize | READY_EXTERNAL | Recomendações locais; mudanças tipadas exigem manual. |
| Scale | READY_EXTERNAL | `FINANCIAL_WRITE`, grant manual por `action_id`. |
| Report | READY_EXTERNAL | `ReportResult` não contém delivery; adapters de entrega são dry-run. |

## Dashboards

| Plataforma | Status | Evidência |
| --- | --- | --- |
| Instagram | READY_EXTERNAL | Apify mock, métricas normalizadas e cache local preservado em erro. |
| TikTok | READY_EXTERNAL | Apify mock, métricas normalizadas e cache local preservado em erro. |
| YouTube | READY_EXTERNAL | Apify mock, métricas normalizadas e cache local preservado em erro. |
| LinkedIn | READY_EXTERNAL | Apify mock, métricas normalizadas e cache local preservado em erro. |

## Publishers

| Plataforma | Status | Dependência e handoff |
| --- | --- | --- |
| Instagram | BLOCKED_EXTERNAL | Adapter oficial ausente; usar handoff manual aprovado. |
| Facebook | BLOCKED_EXTERNAL | Adapter oficial ausente; usar handoff manual aprovado. |
| LinkedIn | BLOCKED_EXTERNAL | Adapter oficial ausente; usar handoff manual aprovado. |
| TikTok | BLOCKED_EXTERNAL | Adapter oficial ausente; usar handoff manual aprovado. |
| YouTube | BLOCKED_EXTERNAL | Adapter oficial ausente; usar handoff manual aprovado. |

## Orquestração

| Workflow | Status | Evidência |
| --- | --- | --- |
| Executor | READY | Aceita somente workflow registrado, propaga risco externo/financeiro e bloqueia shell, desconhecidos ou approval ausente. |
| Toolkit | READY | Estado persistente, idempotência e dependências bloqueadas; reutiliza o gate do executor e reavalia approval sem concluir automaticamente. |
| Comercial | READY | Módulo geral funciona; somente módulo HT fica bloqueado e preserva artefatos. |

## READY_EXTERNAL: contrato operacional

`READY_EXTERNAL` não significa que o provider live foi validado. Significa que o contrato canônico, a fronteira de segurança e o mock/dry-run foram concluídos; a ativação real ainda exige runtime autorizado, credencial provisionada e os gates de approval aplicáveis.

| Workflow | Provider / capability | Secret lógico | Approval | Mock test | Command | Inputs / outputs |
| --- | --- | --- | --- | --- | --- | --- |
| Pesquisa especializada | Apify ou Ads Library / `research.fetch` | `APIFY_API_TOKEN` ou `META_ACCESS_TOKEN` | não financeiro | `market-research-workflow.test.js` | `produto-concepcao` | contexto → `pesquisa-mercado.md` |
| Low / Middle Ticket handoff | Meta / `ads.campaign.create` | `META_ACCESS_TOKEN` | manual | testes LT/MT | `lt-*`, estrategista MT | plano → handoff dry-run |
| Image | OpenRouter, Freepik / `image.generate` | provider lógico | não financeiro | `image-generation.test.js` | `criativo-estatico` | brief → artifact |
| Video externo | HeyGen, Replicate / `video.generate` | `HEYGEN_API_KEY`, `REPLICATE_API_TOKEN` | não financeiro | `video-generation.test.js` | `video-*` | roteiro → job/result |
| Meta insights | Meta / `ads.insights` | `META_ACCESS_TOKEN` | READ | `meta-ads-workflow.test.js` | `trafego-insights` | conta/período → insights |
| Meta create / optimize | Meta / operation allowlisted | `META_ACCESS_TOKEN` | manual | `meta-ads-workflow.test.js` | `trafego-criar-campanha`, `trafego-otimizar` | plano → descriptor `PAUSED` |
| Meta scale | Meta / `ads.scale` | `META_ACCESS_TOKEN` | manual obrigatório | `meta-ads-workflow.test.js` | `trafego-escalar` | ação → descriptor financeiro |
| Ads report | Meta read / `ads.insights` | `META_ACCESS_TOKEN` | READ; entrega separada | `ads-report*.test.js` | `ads-relatorio` | período → `ReportResult`/artefato |
| Dashboards sociais | Apify / `research.fetch` | `APIFY_API_TOKEN` | não financeiro | `social-dashboard-workflow.test.js` | dashboards compatíveis | handle → JSON normalizado |

## Legacy preservado

| Item | Destino canônico / motivo |
| --- | --- |
| Z-API | `LEGACY / NOT USED`; WhatsApp canônico é UAZAPI. |
| `RELATORIO_AUTH_MODO` | `LEGACY_CONFIG`; não orienta workflow novo. |
| `FB_ACCESS_TOKEN_*`, `ACCESS_TOKEN` | `LEGACY_ALIAS` para `META_ACCESS_TOKEN`. |
| `FB_AD_ACCOUNT_ID`, `AD_ACCOUNT_ID` | `LEGACY_ALIAS` para `META_AD_ACCOUNT_ID`. |
| `meta-conexao`, `gerar-token-facebook-ads` | aliases para commands canônicos. |
| aliases e scripts Meta históricos | Compatibilidade preservada fora do caminho canônico; as skills de tráfego usam metodologia canônica e operations allowlisted. |
| `relatorio-ads.ps1` | builder legado sem delivery; Python é o caminho preferido. |
