---
name: carrossel-agendar
description: Persiste descriptor de agendamento de carrossel sem publicar ou criar cron.
version: 1.0.0
workflow_id: carousel.schedule
mode: dry_run
---

Leia `adapters/hermes/SOURCE-POLICY.md`. Use `.claude/commands/programar-carrossel-noticia.md` somente como metodologia. Agendamento persistido não é publicação, e descriptor cron não é cron criado. Preserve `publication:false`, `scheduled:false` e `relatorio_cron_id:null`.
