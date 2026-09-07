---
name: workshop-marketing:ads-relatorio
description: Cria relatório de Meta Ads separado de qualquer entrega por canal.
allowed-tools: Read, Write
---

# Relatório Ads

O fluxo canônico é sempre:

```text
Meta read → ReportResult → artifact local → delivery opcional
```

Escolha período, métricas e filtros. A aquisição usa `ads.insights` ou o transport configurado por `META_AUTH_MODO`:

- `MCP_CONECTOR`: o conector é dono do OAuth;
- `APP`: o adapter declara `META_ACCESS_TOKEN` como requisito lógico e o runtime autorizado faz a injeção.

Ambos produzem o mesmo `ReportResult`: período, métricas normalizadas, análise, `artifact_path` e `delivery: null`. A leitura é `READ`; não concede autorização para criar, ativar, otimizar ou escalar campanhas.

`META_AD_ACCOUNT_ID` é configuração não secreta. `RELATORIO_AUTH_MODO` é `LEGACY_CONFIG` e não deve orientar novos workflows. Não leia `.env`, não use aliases legados e não manipule token, cabeçalho ou URL de autenticação.

Para entrega, use o workflow separado `/enviar-relatorio-ads`; o report builder não escolhe canal nem envia mensagem.
