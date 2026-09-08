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

## Nota histórica

Existe um registro histórico de runtime separado. Ele não é fonte
metodológica canônica nem autoridade operacional.

## Inputs, trilha e janelas

Receba conta canônica, escopo, nível, tipo de funil, ticket, período, campos e
breakdowns. Declare a janela de atribuição no output. Cruze três janelas por
trilha: curta para resposta, média para decisão e longa para tendência. Ajuste
as janelas pelo ticket, pela fase de lançamento e pela maturação do evento.
Período customizado ou lifetime deve ser identificado, sem comparação enganosa.

## Métricas e fórmulas

Normalize gasto, alcance, impressões, frequência, cliques, CTR, CPM, CPC,
resultados, custo por resultado, eventos e valor quando disponível. Diferencie
métrica-norte, métricas leading e eventos brutos. Calcule taxas entre etapas
somente com denominador positivo; denominador zero fica indisponível. Dados
imaturos não recebem diagnóstico definitivo.

## Conta, cache e falha parcial

Em conta completa, primeiro liste e classifique campanhas; depois faça
drill-down nos casos prioritários. Use cache de memória para sessão e cache
local para períodos repetidos. Invalide por mudança de período, nível, campos,
breakdown, janela ou escopo. Falha recuperável preserva o relatório, marca o
item e inclui bloco de erros. Falha fatal retorna estado claro, sem inventar
métricas.

## Breakdowns e output

Breakdowns incluem idade, gênero, geografia, posicionamento, dispositivo,
horário e histórico, separados do agregado. O payload contém contexto,
atribuição, janelas, métricas nativas e derivadas, maturidade, cache, erros,
ranking e interpretação cautelosa. Comparação, ranking, funil por campanha e
histórico mensal consomem apenas dados normalizados.
