---
name: trafego-escalar
description: Metodologia neutra para escala controlada de campanhas.
---

# Escala de tráfego

## Método

Avalie prontidão por volume, CPA, ROAS quando confiável, frequência, fadiga,
qualidade de conversão, maturidade do pixel, risco de aprendizagem, orçamento
ABO/CBO, tetos e freios. Compare escala vertical, horizontal e combinada;
registre velocidade, impacto esperado e condição de reversão.

Sem dado suficiente, a ação correta é aguardar ou voltar à otimização. A
metodologia nunca transforma uma recomendação em alteração automática.

## Boundary canônico

Execução é exclusivamente `ads.scale`, classificada `FINANCIAL_WRITE`. Exige
ApprovalPolicy manual e grant que corresponda ao `action_id`; policy standing
não autoriza escala. O resultado é apenas dry-run ou elegibilidade, nunca uma
chamada ao provider.

## Modos e prontidão

Escala vertical aumenta investimento no mesmo conjunto vencedor; horizontal
replica a hipótese vencedora em novo público, ângulo, placement ou criativo;
a combinação vertical e horizontal só é apropriada quando há sinais estáveis
nos dois eixos. CBO deve ser escolhido pela necessidade de distribuição entre
conjuntos, não como atalho para remover controle. Advantage exige hipótese,
baseline e critério de comparação claros.

Considere uma unidade pronta somente quando houver volume suficiente,
resultado dentro da meta, tendência estável, tracking confiável, frequência
aceitável, criativo sem fadiga forte e capacidade operacional para atender a
demanda. Falta de qualquer condição relevante devolve o caso à otimização.

## Velocidade, freios e tetos

Defina velocidade de aumento, intervalo de observação, teto por etapa e teto
total antes de propor a escala. Revalide após cada incremento: CPA, ROAS
quando aplicável, taxa de conversão, qualidade, frequência, entrega e estado
de aprendizagem. Freios incluem piora sustentada de eficiência, queda de
qualidade, saturação, limite de estoque/capacidade e inconsistência de dados.

Para tickets e lançamentos, ajuste a janela de observação ao ciclo de decisão;
não trate atraso de conversão como fracasso imediato. Documente a condição de
retorno à otimização e o plano de reversão. Nenhuma projeção deve ser vendida
como certeza.

## Gate financeiro e output

O output contém modo de escala, baseline, incremento, limites, razões,
indicadores de prontidão, freios, janela de revalidação e `action_id`. Como
qualquer alteração de orçamento é financeira, só pode ficar elegível com
ApprovalPolicy manual e grant exato. Policy standing, autorização genérica ou
conexão autenticada não substituem esse grant.

## Nota histórica

Existe um registro histórico de runtime separado. Ele não é fonte metodológica
canônica nem pré-requisito para aplicar este guia.
