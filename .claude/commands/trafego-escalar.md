---
name: workshop-marketing:trafego-escalar
description: Avalia escala de tráfego sem permitir alterações financeiras sem grant manual específico.
allowed-tools: Read, Write
---

# Escalar tráfego

`ads.scale` é uma operação `FINANCIAL_WRITE`. A análise de oportunidades pode ser feita sobre insights normalizados, mas executar uma escala exige ApprovalPolicy `manual`, `action_id` e grant manual correspondentes ao workflow, produto e ação solicitados.

Sem grant, ou com grant de outra ação, retorne `blocked`. Frases como “pode escalar” ou “continua” não constituem standing approval financeira. A conexão Meta não autoriza gasto.

Nesta fase, produza apenas um plano ou descriptor dry-run. `META_ACCESS_TOKEN` é requisito lógico exclusivo do adapter; não leia `.env`, não use aliases, não monte requisições diretas e não altere orçamento.
