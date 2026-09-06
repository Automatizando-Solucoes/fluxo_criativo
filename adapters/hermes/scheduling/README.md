# Hermes cron adapter

`toHermesCronJob(job)` traduz somente um `ScheduledJob` válido em descriptor Hermes. Não cria cron, não inicia processo e não chama workflow.

Timezone, `idempotency_key`, workdir, destino e `ApprovalPolicy` são preservados. `disabled` retorna `scheduled: false`; `manual` retorna `manual_approval_required`; `standing` mantém o escopo inteiro, sem conceder capability externa. Todos os descriptors permanecem `dry_run`.
