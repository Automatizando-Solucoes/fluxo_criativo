# Contrato de scheduler

Um job neutro descreve agendamento; ele não instala cron, não chama `/schedule` e não executa workflow nesta fase.

| Campo | Descrição |
| --- | --- |
| `job_id` | Identificador único do job. |
| `workflow_id` | Workflow lógico a ser resolvido por adapter futuro. |
| `input` | Entrada serializável do workflow. |
| `schedule` | `{ kind: 'cron', expression }` ou `{ kind: 'once', at }`. |
| `timezone` | Timezone IANA validada. |
| `idempotency_key` | Chave para evitar duplicação no adapter executor. |
| `approval_policy` | `ApprovalPolicy` válida, cujo `workflow_id` deve corresponder ao job. |
| `destination` | Destino lógico, sem provider concreto. |
| `enabled` | Se o job pode ser considerado por executor futuro. |

Adapters futuros podem traduzir o contrato para Claude `/schedule`, cron Hermes, system cron ou n8n. Cada rotina de carrossel continuará tendo seu próprio identificador de agendamento; o fluxo de relatório Ads permanece separado, conforme a documentação de dependências.

`InMemoryScheduler` é somente uma implementação de teste. Ele rejeita tanto `job_id` quanto `idempotency_key` já registrados. Portanto, dois IDs diferentes não podem representar a mesma intenção idempotente silenciosamente.
