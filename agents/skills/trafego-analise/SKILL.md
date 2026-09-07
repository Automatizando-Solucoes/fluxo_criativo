---
name: trafego-analise
description: Metodologia VTSD neutra para diagnóstico de tráfego baseado em insights normalizados.
---

# Análise de tráfego

## Papel

Consuma insights já normalizados. A análise não busca credenciais, não decide
transportes e não executa ações externas.

## Diagnóstico VTSD

Preserve os recortes de diagnóstico rápido, performance de funil, criativos e
copy, geografia e demografia, timing e sazonalidade, investigação profunda,
lifecycle, problemas ocultos, orçamento e projeção, e comparativo A x B.

Para cada recorte: informe a métrica observada, o benchmark ou comparação, a
hipótese, a confiança e a próxima ação recomendada. Dados insuficientes devem
ficar explícitos, sem inventar causalidade. A recomendação de orçamento é uma
recomendação, nunca uma mudança.

## Boundary canônico

Quando forem necessários novos dados, o workflow solicita `ads.insights` ou
outra operação Meta allowlisted. Exportação e persistência usam os contratos
locais do produto. Alterações são tratadas por `ads.optimize`,
`ads.campaign.update_status` ou `ads.scale`, cada qual com seu gate.

## Legado

O material histórico misturado a scripts e sub-skills está quarentenado em
`.claude/skills/trafego-analise/legacy-runtime/`. Não é fonte canônica nem
deve ser executado por runtimes.
