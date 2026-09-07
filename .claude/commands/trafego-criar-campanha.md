---
name: workshop-marketing:trafego-criar-campanha
description: Prepara campanhas Meta pausadas por padrão e exige aprovação manual para criar recursos externos.
allowed-tools: Read, Write
---

# Criar campanha de tráfego

Transforme o plano aprovado em um draft de campanha. A operação canônica é `ads.campaign.create`, classe `WRITE`, com `META_AD_ACCOUNT_ID` como configuração não secreta e `META_ACCESS_TOKEN` apenas como requisito lógico do adapter.

Uma criação requer ApprovalPolicy `manual` vinculada ao `action_id` exato. Sem grant manual válido, retorne `blocked`; nunca infira autorização por conversa, conexão ou análise anterior.

Use a metodologia canônica em `.claude/skills/trafego-criar-campanha/SKILL.md`. Toda nova campanha deve nascer com `status: PAUSED`. Não há caminho automático para `ACTIVE`. Nesta fase, gere somente draft/descriptor dry-run; não leia `.env`, não use aliases de token e não faça requisição direta.
