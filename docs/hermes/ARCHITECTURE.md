# Arquitetura Hermes em dry-run

```text
core workflow registry
        ↓
Hermes resolver
        ↓
wrapper conhecido
        ↓
estado local em meus-produtos
```

Wrappers consultam fontes Claude por referência, sem copiar a inteligência. `adapters/hermes/SOURCE-POLICY.md` separa metodologia de instruções específicas do runtime Claude: apenas wrapper, core e adapter Hermes podem autorizar operação. Capacidades externas, cron, delegates, gateway e injeção de segredos ficam atrás de contratos próprios e não são executados nesta fase.

Delegates recebem apenas tarefa, produto, paths de entrada, contrato de saída e capabilities locais já permitidas pelo workflow. Eles não recebem segredo, policy mais ampla, capacidade externa, permissão para publicar/gastar ou permissão para criar outro delegate.

O adapter de cron recebe um `ScheduledJob` já validado pelo core e um contexto de approval separado, avaliando a policy real com escopo, validade, revogação e limites. Ele preserva timezone, chave de idempotência, workdir, approval e destino. Nenhum descriptor cria cron real: `scheduled` é sempre `false`; `eligible_for_schedule` só pode ser verdadeiro para workflow local com standing válida. `disabled`, `manual` e capabilities externas bloqueiam.

Gateway é representado por descriptors de `approval.request`, `workflow.completed`, `workflow.failed` e `report.ready`. Eles não conectam Telegram, WhatsApp, Slack ou Discord e rejeitam campos de segredo no payload.
