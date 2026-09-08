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

## Leitura por plataforma e decisão

Para cada plataforma, identifique o período, perfil comparado, conteúdo de
melhor e pior desempenho, frequência, formato, alcance, retenção quando
disponível, engajamento e crescimento. Normalize unidades, diferencie dado
observado de inferência e compare apenas períodos equivalentes. A leitura deve
terminar em padrões, oportunidades, riscos e lacunas, nunca em certeza sem
amostra suficiente.

## Cache e falha

O cache é uma fotografia datada do produto, com plataforma, janela, origem,
métricas normalizadas e interpretação. Ao ocorrer falha parcial, preserve o
último cache útil, registre `source_failed`, informe quais campos ficaram
indisponíveis e não escreva conteúdo vazio sobre um artefato válido.

## Boundary canônico

Aquisição é `research.fetch` via `core/external/social-dashboard.js`, com
`APIFY_API_TOKEN` apenas como nome lógico e somente no boundary de secret.
Todo resultado externo permanece dry-run/mock nesta arquitetura.

## Nota histórica

Existe um procedimento histórico de scripts separado. Ele não é fonte
metodológica canônica e não pode ser executado automaticamente.
