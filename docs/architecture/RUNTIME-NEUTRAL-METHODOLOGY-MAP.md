# Mapa de metodologia neutra de runtime

## Classificação auditada

| Área | Classificação anterior | Fonte canônica atual | Regra de migração |
| --- | --- | --- | --- |
| Light Copy e revisão | METHODOLOGY misturada a skill Claude | `agents/skills/revisora/`, `agents/skills/elementos-literarios/`, `agents/methodology/copy/manual-copy.md` | Metodologia e checklist são neutros; UX Claude é ponte. |
| Pesquisa de mercado | METHODOLOGY + PROVIDER_OPERATION | `agents/skills/pesquisa-mercado/SKILL.md` | Nove eixos ficam na metodologia; aquisição fica em `core/external/research.js`. |
| Tráfego Meta | METHODOLOGY + RUNTIME_INSTRUCTION | `agents/skills/trafego-*/SKILL.md` | Decisão fica na skill; APP/MCP, segredo e operation IDs ficam no boundary Meta. |
| Páginas e carrosséis | METHODOLOGY + comandos/scripts históricos | `agents/skills/paginas/` e `agents/skills/carrossel/` | Critérios e referências permanecem; deploy, render, cron e publicação são separados. |
| Dashboard social | METHODOLOGY + scripts de provider | `agents/skills/dashboard-social/SKILL.md` | Métricas e cache são neutros; provider é `core/external/social-dashboard.js`. |
| Produto, funis, criativos, relatório, social e comercial | BUSINESS_CONTRACT/METHODOLOGY | `agents/methodology/**` | Sem provider, segredo ou instrução de runtime. |
| Approval, segredos, segurança e proveniência | SECURITY_POLICY | `agents/policies/**` | A política descreve limites; a execução fica no core. |

## Conteúdo preservado como legado

Diretórios `.claude/skills/*/legacy-runtime/` mantêm material original que
mistura metodologia com comandos, scripts ou provider runtime. Eles são
`LEGACY_COMPATIBILITY`: não são usados pelas matrizes Claude, Hermes ou Codex,
nem por adapters. Nenhum conteúdo foi promovido a autoridade operacional por
estar arquivado.

## Direção de dependência

`agents/` pode referenciar contratos por ID. `core/` não importa adapters.
Cada adapter pode consumir `agents/` e `core/`, mas adapters não se importam
entre si. Referências de Hermes ou Codex a `.claude/` são proibidas como
dependência operacional; a única referência catalogada é a documentação legada
do estrategista High Ticket, bloqueada por `ht-*`.
