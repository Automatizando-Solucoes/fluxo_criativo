# Hermes cron adapter

`toHermesCronJob(job, approvalContext)` traduz somente um `ScheduledJob` válido em descriptor Hermes. Não cria cron, não inicia processo e não chama workflow. O contexto de approval é separado: o adapter deriva apenas `workflow_id` e `product` do job quando inequívocos; rede, tipo de ação, uso e outros campos limitados devem vir do chamador.

Timezone, `idempotency_key`, workdir, destino e `ApprovalPolicy` são preservados. O adapter usa `evaluateApproval`; falhas de escopo, expiração, revogação ou limite bloqueiam. `disabled` retorna `approval_disabled`; `manual` retorna `manual_approval_required`; e qualquer capability externa retorna `external_capability_blocked` mesmo com standing válida. Todos os descriptors têm `scheduled: false` e `mode: dry_run`; apenas `eligible_for_schedule` informa a futura elegibilidade de workflow local.
