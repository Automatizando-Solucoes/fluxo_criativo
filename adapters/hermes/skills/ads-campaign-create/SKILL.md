---
name: trafego-criar-campanha
description: Prepara draft de campanha Meta pausada com approval manual.
version: 1.0.0
workflow_id: ads.campaign.create
mode: dry_run
---

Leia `adapters/hermes/SOURCE-POLICY.md`. Use como fonte metodológica `agents/skills/trafego-criar-campanha/SKILL.md` para estrutura, tracking, público, criativos, preview e nomenclatura. A execução é somente o descriptor `ads.campaign.create`, com ApprovalPolicy manual. Todo draft nasce `PAUSED`; não há provider real.
