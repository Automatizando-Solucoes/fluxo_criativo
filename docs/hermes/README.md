# Hermes Adapter

Esta documentação descreve a ponte dry-run entre o core neutro e Hermes. Claude Code continua sendo o runtime funcional de referência; Hermes é o runtime alvo em adaptação. Ela não instala Hermes, não inicia gateway, não cria cron real e não chama providers.

O estado de negócio continua em `meus-produtos/`; `HERMES.md` é o contexto operacional próprio do runtime. Consulte a [matriz de paridade](PARITY-MATRIX.md) e o [plano de migração](MIGRATION-PLAN.md), além dos contratos em `core/`, antes de evoluir wrappers, delegates, cron ou integrações.
