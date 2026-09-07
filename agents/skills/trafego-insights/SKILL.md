---
name: trafego-insights
description: Metodologia neutra para interpretar métricas de tráfego pago.
---

# Insights de tráfego

## Papel

Esta é a fonte canônica de método para `ads.insights`. Ela recebe resultados
normalizados pelo adapter e os transforma em leitura de desempenho. Não acessa
providers, credenciais, arquivos de ambiente ou ferramentas de runtime.

## Método

1. Defina período, janela de atribuição e nível de análise.
2. Leia gasto, alcance, impressões, frequência, cliques, CTR, CPM, CPC,
   resultados e custo por resultado.
3. Compare período atual, média histórica e recortes por campanha, conjunto,
   anúncio, posicionamento, público e criativo quando estiverem disponíveis.
4. Declare lacunas de dados e preserve cache ou artefato anterior quando a
   fonte não responder.
5. Entregue fatos, derivadas e hipóteses separadamente. Insights não executam
   mudanças.

## Boundary canônico

Aquisição é uma operação allowlisted do contrato `ads.insights` em
`core/external/meta-ads.js`. O adapter escolhe APP ou MCP_CONECTOR, sem expor
segredo. Breakdowns e leitura de contexto da conta usam apenas operações Meta
allowlisted. O resultado normalizado pode alimentar análise, otimização e
escala, mas não concede approval de escrita.

## Legado

O roteiro histórico que misturava instruções de runtime está em
`.claude/skills/trafego-insights/legacy-runtime/`. Não é fonte canônica nem
autoridade operacional.
