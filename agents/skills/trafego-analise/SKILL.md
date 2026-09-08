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

## Roteamento por output

Escolha o recorte antes de concluir: diagnóstico rápido para priorização,
performance de funil para localizar a perda, criativos para avaliar ângulo e
fadiga, geo/demografia para distribuição, timing para sazonalidade,
investigação para hipótese complexa, lifecycle para mudança histórica,
problemas ocultos para causas indiretas, orçamento/projeção para cenários e
comparativo para testes A x B. Um mesmo dado pode aparecer em mais de um
recorte, mas a conclusão precisa declarar qual pergunta responde.

## Health score e evidência

Classifique saúde por entrega, atenção, clique, conversão, eficiência,
qualidade e confiabilidade dos dados. O score organiza prioridade, não
substitui evidência. Para cada alerta, mostre denominador, janela, tendência,
baseline, hipótese, confiança, investigação necessária e próximo passo.
Métricas sem volume mínimo, mudança de atribuição ou tracking inconsistente
devem ser marcadas como inconclusivas.

## Protocolo dos dez outputs

Os subguias canônicos em `sub-skills/` detalham diagnóstico rápido,
performance de funil, criativos, geo/demografia, timing/sazonalidade,
investigação profunda, lifecycle, problemas ocultos, orçamento/projeção e
comparativo. Todos consomem insights normalizados e terminam em hipótese,
evidência, risco e ação recomendada. Nenhum deles executa ação externa.

## Boundary canônico

Quando forem necessários novos dados, o workflow solicita `ads.insights` ou
outra operação Meta allowlisted. Exportação e persistência usam os contratos
locais do produto. Alterações são tratadas por `ads.optimize`,
`ads.campaign.update_status` ou `ads.scale`, cada qual com seu gate.

## Nota histórica

Existe um registro histórico de runtime separado. Ele não é fonte metodológica
canônica nem deve ser executado por runtimes.
