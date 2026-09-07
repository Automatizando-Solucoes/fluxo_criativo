# Compatibilidade de skills Hermes

Esta é uma allowlist de avaliação, não uma configuração para carregar toda `.claude/skills/`. As fontes continuam no diretório Claude e não são movidas.

| Skill/conhecimento | Classe | Fonte | Motivo |
| --- | --- | --- | --- |
| `revisora` | `HERMES_NATIVE` | `.claude/skills/revisora/SKILL.md` | Metodologia local de revisão; sem provider ou command operacional. |
| `elementos-literarios` | `HERMES_NATIVE` | `.claude/skills/elementos-literarios/SKILL.md` | Conhecimento procedural de Light Copy. |
| `manual-copy` | `HERMES_NATIVE` | `revisora/references/manual-copy.md` | Referência local metodológica. |
| `pesquisa-mercado` | `HERMES_WRAPPER` | `.claude/skills/pesquisa-mercado/SKILL.md` | Depende de pesquisa externa; precisa de adapter e gate. |
| `video-avancado` | `HERMES_WRAPPER` | `.claude/skills/video-avancado/SKILL.md` | Metodologia reutilizável; render continua dry-run. |
| `instagram-dashboard` | `HERMES_WRAPPER` | `.claude/skills/instagram-dashboard/SKILL.md` | Apify permanece em boundary externo dry-run. |
| `tiktok-dashboard` | `HERMES_WRAPPER` | `.claude/skills/tiktok-dashboard/SKILL.md` | Apify permanece em boundary externo dry-run. |
| `youtube-dashboard` | `HERMES_WRAPPER` | `.claude/skills/youtube-dashboard/SKILL.md` | Apify permanece em boundary externo dry-run. |
| `linkedin-dashboard` | `HERMES_WRAPPER` | `.claude/skills/linkedin-dashboard/SKILL.md` | Apify permanece em boundary externo dry-run. |
| `anuncios` | `HERMES_WRAPPER` | `.claude/skills/anuncios/SKILL.md` | Conhecimento reaproveitável, mas ligado declarativamente a command Claude. |
| `paginas` | `HERMES_WRAPPER` | `.claude/skills/paginas/SKILL.md` | Pressupõe commands, scripts e escrita de artefatos. |
| `vtsd-completo` | `HERMES_NATIVE` | `.claude/skills/vtsd-completo/SKILL.md` | Metodologia local de produto usada pelo wrapper Hermes. |
| `criacao-produto-low-ticket` | `HERMES_WRAPPER` | `.claude/skills/criacao-produto-low-ticket/SKILL.md` | Estrutura LT; handoff Meta permanece dry-run. |
| `carrossel` | `HERMES_WRAPPER` | `.claude/skills/carrossel/SKILL.md` | Geração local, sem agendamento ou publicação. |
| `trafego-pago` | `HERMES_NATIVE` | `.claude/skills/trafego-pago/SKILL.md` | Conhecimento metodológico de campanhas, métricas e decisão. |
| `trafego-insights` | `HERMES_WRAPPER` | `.claude/skills/trafego-insights/SKILL.md` | Metodologia segura; aquisição usa `ads.insights` via adapter. |
| `trafego-analise` | `HERMES_WRAPPER` | `.claude/skills/trafego-analise/SKILL.md` | Diagnóstico VTSD sobre insights normalizados. |
| `trafego-criar-campanha` | `HERMES_WRAPPER` | `.claude/skills/trafego-criar-campanha/SKILL.md` | Estrutura de campanha; criação é manual e `PAUSED`. |
| `trafego-otimizar` | `HERMES_WRAPPER` | `.claude/skills/trafego-otimizar/SKILL.md` | Recomendações e mudanças tipadas via adapter. |
| `trafego-escalar` | `HERMES_WRAPPER` | `.claude/skills/trafego-escalar/SKILL.md` | Escala é `FINANCIAL_WRITE` com grant manual. |

## Classes

- `HERMES_NATIVE`: conhecimento metodológico/procedural que Hermes pode ler por referência, após allowlist explícita.
- `HERMES_WRAPPER`: conhecimento reaproveitável, mas só exposto por wrapper que conserva limites do core.
- `CLAUDE_ONLY_TEMP`: dependência forte de Claude, sem adapter seguro; não cria wrapper executável.

Skills fora desta matriz não estão aprovadas para carregamento Hermes. As cinco skills `trafego-*` acima foram sanitizadas na Fase K e não são Claude-only: seus operations IDs runtime-neutral podem ser consumidos por wrapper, nunca como chamada direta de provider. Qualquer skill que manipule `.env`, peça token, use Bash, `/schedule`, `Skill`/`Agent` Claude, MCP Claude ou API externa continua bloqueada até adapter próprio.

Todo wrapper Hermes também referencia `adapters/hermes/SOURCE-POLICY.md`. A fonte Claude pode informar método e contexto, mas nunca autoriza comportamento operacional Hermes.
