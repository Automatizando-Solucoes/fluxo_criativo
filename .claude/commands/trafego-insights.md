---
name: workshop-marketing:trafego-insights
description: Obtém e normaliza insights de Meta Ads por meio do adapter canônico, sempre em modo seguro.
allowed-tools: Read
---

# Insights de tráfego

Use o contrato canônico `ads.insights`. Os inputs não secretos são `META_AD_ACCOUNT_ID`, período, campos e breakdown. O adapter declara `META_ACCESS_TOKEN` somente como requisito lógico; o valor é injetado pelo runtime autorizado e nunca é mostrado ao modelo.

`ads.insights` é uma operação `READ`: ela não altera campanha, status ou orçamento. Nesta fase, gere apenas descriptor ou resultado mock/dry-run e salve o resultado normalizado no diretório do produto quando houver um artefato solicitado.

Use a metodologia canônica em `.claude/skills/trafego-insights/SKILL.md`. A aquisição usa somente `ads.insights` via adapter. Não leia `.env`, não use aliases históricos, não monte requisições HTTP e não chame provider diretamente.
