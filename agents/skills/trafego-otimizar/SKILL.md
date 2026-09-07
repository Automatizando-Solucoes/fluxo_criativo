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

## Legado

O roteiro histórico está em `.claude/skills/trafego-otimizar/legacy-runtime/`
e não tem autoridade operacional.
