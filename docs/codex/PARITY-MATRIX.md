# Matriz Codex

O adapter Codex cobre os 26 workflows do registry pelo mesmo `core/` usado por Claude e Hermes.

- `CODEX_READY`: 12 workflows locais e de orquestração.
- `CODEX_EXTERNAL_DRY_RUN`: 12 boundaries externos mockados.
- `CODEX_BLOCKED_EXTERNAL`: `social.publish`.
- `CODEX_LEGACY`: `traffic.insights`, alias de `ads.insights`.

As fontes metodológicas canônicas vivem em `agents/`, não em `.claude/`.

| Workflow | Status Codex | Fonte metodológica | Boundary core |
| --- | --- | --- | --- |
| `product.create`, `product.select` | `CODEX_READY` | `agents/methodology/product/lifecycle.md` | `core/local/workflows.js` |
| `research.market` | `CODEX_EXTERNAL_DRY_RUN` | `agents/skills/pesquisa-mercado/SKILL.md` | `core/external/research.js` |
| `copy.page` | `CODEX_READY` | `agents/skills/paginas/SKILL.md` | `core/local/workflows.js` |
| `copy.ad` | `CODEX_READY` | `agents/skills/anuncios/SKILL.md` | `core/local/workflows.js` |
| `copy.social` | `CODEX_READY` | `agents/skills/revisora/SKILL.md` | `core/local/workflows.js` |
| `copy.script` | `CODEX_READY` | `agents/methodology/copy/manual-copy.md` | `core/local/workflows.js` |
| `funnel.low_ticket` | `CODEX_EXTERNAL_DRY_RUN` | `agents/skills/criacao-produto-low-ticket/SKILL.md` | `core/local/workflows.js` |
| `funnel.middle_ticket` | `CODEX_EXTERNAL_DRY_RUN` | `agents/methodology/funnels/middle-ticket.md` | `core/local/workflows.js` |
| `page.sales` | `CODEX_READY` | `agents/skills/paginas/SKILL.md` | `core/local/workflows.js` |
| `carousel.generate`, `carousel.schedule` | `CODEX_READY` | `agents/skills/carrossel/SKILL.md` | `core/local/workflows.js` |
| `image.generate`, `creative.static` | `CODEX_EXTERNAL_DRY_RUN` | `agents/methodology/creative/static.md` | `core/external/image.js` |
| `video.generate` | `CODEX_EXTERNAL_DRY_RUN` | `agents/skills/video-avancado/SKILL.md` | `core/external/video.js` |
| `ads.insights` | `CODEX_EXTERNAL_DRY_RUN` | `agents/skills/trafego-insights/SKILL.md` | `core/external/meta-ads.js` |
| `traffic.insights` | `CODEX_LEGACY` | `agents/skills/trafego-insights/SKILL.md` | alias de `ads.insights` |
| `ads.campaign.create` | `CODEX_EXTERNAL_DRY_RUN` | `agents/skills/trafego-criar-campanha/SKILL.md` | `core/external/meta-ads.js` |
| `ads.optimize` | `CODEX_EXTERNAL_DRY_RUN` | `agents/skills/trafego-otimizar/SKILL.md` | `core/external/meta-ads.js` |
| `ads.scale` | `CODEX_EXTERNAL_DRY_RUN` | `agents/skills/trafego-escalar/SKILL.md` | `core/external/meta-ads.js` |
| `ads.report` | `CODEX_EXTERNAL_DRY_RUN` | `agents/methodology/traffic/ads-report.md` | `core/external/ads-report.js` |
| `social.dashboard` | `CODEX_EXTERNAL_DRY_RUN` | `agents/skills/dashboard-social/SKILL.md` | `core/external/social-dashboard.js` |
| `social.publish` | `CODEX_BLOCKED_EXTERNAL` | `agents/methodology/social/publishing.md` | `core/external/organic-publisher.js` |
| `plan.execute`, `toolkit.execute` | `CODEX_READY` | `agents/methodology/orchestration/plan-toolkit.md` | `core/orchestration/` |
| `commercial.playbook` | `CODEX_READY` | `agents/methodology/commercial/playbook.md` | `core/local/workflows.js` |

O arquivo executável `adapters/codex/parity.js` é a matriz completa, incluindo
risco externo/financeiro, approval, kind e `risk_from_children` de cada ID.
