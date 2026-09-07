---
name: dashboard-social
description: Metodologia neutra para dashboards sociais normalizados.
---

# Dashboards sociais

## Método

Para Instagram, TikTok, YouTube e LinkedIn, normalize métricas de perfil,
conteúdo, alcance, crescimento, engajamento e padrões de publicação. Compare
períodos e concorrentes somente quando os dados já estiverem disponíveis.

O cache é local ao produto. Falha de fonte deve preservar um cache útil, nunca
substituí-lo por resposta vazia. O resultado separa métricas observadas,
insights e lacunas de dados.

## Boundary canônico

Aquisição é `research.fetch` via `core/external/social-dashboard.js`, com
`APIFY_API_TOKEN` apenas como nome lógico e somente no boundary de secret.
Todo resultado externo permanece dry-run/mock nesta arquitetura.

## Legado

O procedimento histórico de scripts está em
`.claude/skills/dashboard-social/legacy-runtime/`. Ele não é fonte canônica e
não pode ser executado automaticamente.
