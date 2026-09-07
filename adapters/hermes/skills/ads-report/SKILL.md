---
name: ads-relatorio
description: Constrói relatório Ads local e entrega somente descriptor dry-run.
version: 1.0.0
workflow_id: ads.report
mode: dry_run
---

Leia `adapters/hermes/SOURCE-POLICY.md`. Use `.claude/commands/ads-relatorio.md` somente como metodologia para preservar a cadeia Ads read, report build e delivery opcional. O relatório local mantém `delivery:null`; Telegram, WhatsApp ou local recebem apenas descriptor com `sent:false` e `dry_run:true`. Nenhum sender é chamado.
