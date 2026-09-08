---
name: trafego-otimizar
description: Metodologia neutra para diagnóstico e otimização de campanhas.
---

# Otimização de tráfego

## Método

Analise CTR, CPM, CPC, frequência, CPA, conversão, criativo, público,
posicionamento, aprendizagem, fadiga e qualidade do tracking. Separe:

- diagnóstico e recomendação, que são locais;
- mudanças de status ou segmentação, que são `WRITE`;
- qualquer mudança de orçamento, que é `FINANCIAL_WRITE`.

Documente hipótese, evidência, impacto esperado, reversibilidade e critério de
reavaliação. Recomendar não autoriza executar.

## Boundary canônico

Dados vêm de `ads.insights`. Ações não financeiras usam `ads.optimize` ou
`ads.campaign.update_status` com approval manual. Orçamento usa somente
`ads.scale`, com grant manual exato. A skill não acessa provider ou segredo.

## Diagnóstico e trilhas

Faça a leitura nesta ordem: qualidade e maturidade dos dados, entrega,
atenção ao criativo, clique, página/funil, conversão e economia. Compare cada
período com janela equivalente, volume mínimo e meta do produto. Dados ainda
em aprendizagem devem receber observação, não corte precipitado.

Use seis trilhas: entrega e leilão, criativo e fadiga, público e saturação,
funil e conversão, tracking e qualidade de dados, e economia/orçamento. Uma
queda de CPA isolada não prova melhoria se volume, qualidade do lead ou janela
de atribuição mudaram. Registre hipótese, evidência contrária e confiança.

## Critérios de decisão

Priorize ações reversíveis. CTR baixo com entrega suficiente sugere revisar
gancho/criativo; clique saudável e conversão fraca sugere revisar página,
oferta ou tracking; frequência crescente com queda de CTR sugere fadiga;
CPM alto requer leitura de público, placements e concorrência antes de mexer
na copy. Pausa e mudança de status são ações tipadas, nunca consequência
automática de uma recomendação.

Em ações em lote, declare população, regra de inclusão, impacto esperado e
critério de rollback. Não misture alteração de orçamento com otimização:
qualquer mudança de budget deve sair por `ads.scale` e receber o gate
financeiro próprio.

## Handoff e revalidação

Toda recomendação contém owner, ação proposta, motivo, risco, métrica de
revalidação e janela mínima. Após uma ação aprovada, reavalie aprendizagem,
entrega e métrica primária antes de propor nova mudança. Sem approval, o
resultado é diagnóstico e plano, não execução.

## Nota histórica

Existe um registro histórico de runtime separado. Ele não é fonte metodológica
canônica nem pré-requisito para aplicar este guia.
