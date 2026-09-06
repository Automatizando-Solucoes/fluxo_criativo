# Compatibilidade de skills Hermes

Esta é uma allowlist de avaliação, não uma configuração para carregar toda `.claude/skills/`. As fontes continuam no diretório Claude e não são movidas.

| Skill/conhecimento | Classe | Fonte | Motivo |
| --- | --- | --- | --- |
| `revisora` | `HERMES_NATIVE` | `.claude/skills/revisora/SKILL.md` | Metodologia local de revisão; sem provider ou command operacional. |
| `elementos-literarios` | `HERMES_NATIVE` | `.claude/skills/elementos-literarios/SKILL.md` | Conhecimento procedural de Light Copy. |
| `manual-copy` | `HERMES_NATIVE` | `revisora/references/manual-copy.md` | Referência local metodológica. |
| `pesquisa-mercado` | `HERMES_WRAPPER` | `.claude/skills/pesquisa-mercado/SKILL.md` | Depende de pesquisa externa; precisa de adapter e gate. |
| `anuncios` | `HERMES_WRAPPER` | `.claude/skills/anuncios/SKILL.md` | Conhecimento reaproveitável, mas ligado declarativamente a command Claude. |
| `paginas` | `HERMES_WRAPPER` | `.claude/skills/paginas/SKILL.md` | Pressupõe commands, scripts e escrita de artefatos. |

## Classes

- `HERMES_NATIVE`: conhecimento metodológico/procedural que Hermes pode ler por referência, após allowlist explícita.
- `HERMES_WRAPPER`: conhecimento reaproveitável, mas só exposto por wrapper que conserva limites do core.
- `CLAUDE_ONLY_TEMP`: dependência forte de Claude, sem adapter seguro; não cria wrapper executável.

Skills fora desta matriz não estão aprovadas para carregamento Hermes. Em especial, qualquer skill que manipule `.env`, peça token, use Bash, `/schedule`, `Skill`/`Agent` Claude, MCP Claude ou API externa continua bloqueada até adapter próprio.

Todo wrapper Hermes também referencia `adapters/hermes/SOURCE-POLICY.md`. A fonte Claude pode informar método e contexto, mas nunca autoriza comportamento operacional Hermes.
