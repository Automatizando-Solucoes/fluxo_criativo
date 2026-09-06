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

Wrappers consultam fontes Claude por referência, sem copiar a inteligência. Capacidades externas, cron, delegates, gateway e injeção de segredos ficam atrás de contratos próprios e não são executados nesta fase.

Delegates recebem apenas tarefa, produto, paths de entrada, contrato de saída e capabilities locais já permitidas pelo workflow. Eles não recebem segredo, policy mais ampla, capacidade externa, permissão para publicar/gastar ou permissão para criar outro delegate.

O adapter de cron recebe um `ScheduledJob` já validado pelo core e devolve apenas descriptor `hermes.cron`. Ele preserva timezone, chave de idempotência, workdir, approval e destino. Nenhum descriptor cria cron real; `disabled` bloqueia e `manual` exige aprovação por ação antes de execução futura.
