# Contrato comum de copy no Claude Code

Os commands `copy-pagina`, `copy-anuncio`, `copy-social`, `copy-roteiro` e `copy-variacao-post` permanecem as fontes de comportamento do Claude. `adapters/claude/copy-workflow.js` só centraliza o gate verificável que todos devem cumprir antes de persistir uma peça.

## Fonte metodológica preservada

O gate sempre aponta para o Manual da Copy, `elementos-literarios` e `revisora`; ele não copia nem substitui a metodologia. A validação estática bloqueia travessão, exclamação, padrão “Não é X. É Y.”, muletas conhecidas e grafias pt-BR básicas. A revisora continua responsável pela revisão editorial completa.

## Persistência

| Workflow | Command | Saída previsível |
| --- | --- | --- |
| `copy.page` | `/copy-pagina` | `entregas/copy-pagina/copy-{slug}.md` |
| `copy.ad` | `/copy-anuncio` | `entregas/criativos/anuncios-{slug}.md` |
| `copy.social` | `/copy-social` | `entregas/conteudo-social/copy-social-{slug}.md` |
| `copy.script` | `/copy-roteiro` | `entregas/criativos/roteiro-{slug}.md` |
| `copy.post_variation` | `/copy-variacao-post` | `entregas/conteudo-social/variacoes-post-{slug}.md` |

O write requer resultado de revisão aprovado e é confinado a `meus-produtos/{slug}/`. Este contrato não publica, cria mídia, chama provider nem roda agent automaticamente.
