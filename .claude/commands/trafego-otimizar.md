---
name: workshop-marketing:trafego-otimizar
description: Separa diagnóstico de tráfego de ações tipadas que exigem aprovação explícita.
allowed-tools: Read, Write
---

# Otimizar tráfego

Use `ads.insights` para leituras e produza diagnóstico de CTR, CPA, frequência, fadiga e segmentação. Diagnóstico e recomendações são locais e não autorizam qualquer alteração externa.

Mudanças de status, anúncios ou segmentação devem ser descritas como `ads.campaign.update_status` ou `ads.optimize`, classe `WRITE`, e exigem ApprovalPolicy manual vinculada à ação. Qualquer alteração de orçamento é `FINANCIAL_WRITE` e continua manual obrigatória.

Use a metodologia canônica em `.claude/skills/trafego-otimizar/SKILL.md`. Nesta fase, retorne somente recomendação ou descriptor dry-run. Não leia `.env`, não manipule credenciais, não use aliases históricos e não execute API Meta diretamente.
