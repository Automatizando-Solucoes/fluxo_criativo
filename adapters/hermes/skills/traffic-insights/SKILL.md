---
name: trafego-insights
description: Estrutura uma solicitação de insights de tráfego em modo seguro.
version: 1.0.0
workflow_id: traffic.insights
mode: dry_run
---

# Insights de tráfego (Hermes wrapper)

Leia e aplique `adapters/hermes/SOURCE-POLICY.md` antes de consultar qualquer fonte Claude.

1. Resolva `traffic.insights` e exija `product_slug`; `period` é opcional.
2. Consulte somente contexto local de produto quando existir.
3. Use `.claude/commands/trafego-insights.md` como fonte de compatibilidade.
4. Respeite capabilities e `ApprovalPolicy`.

`ads.insights` é externo. Não consulte Ads, não leia segredo e não modifique campanha. Retorne `external_capability_required` com `dry_run`.
