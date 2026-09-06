# Fronteira 1Password no Hermes/VPS

Hermes futuro usará o contrato neutro `has_secret(name)`, `secret_reference(name)` e `run_with_secrets(operation, required_secrets)`. Não existe API que devolva plaintext ao modelo. O modelo pode saber nome lógico, status booleano e referência `op://`, mas nunca o valor.

## Operações allowlisted

O registry local enumera `research.fetch`, `image.generate`, `video.generate`, `ads.insights`, `notification.send` e `publisher.publish`. Nesta fase, todas são `dry_run` e `blocked`; o registry não chama `op`, shell nem provider.

## VPS futura

O host deverá receber uma Service Account dedicada, com menor privilégio, acesso somente de leitura aos vaults necessários, Activity Log, rotação e revogação centralizada. `OP_SERVICE_ACCOUNT_TOKEN` é bootstrap do host: não entra no repositório, `.env.op`, chat, logs ou documentação como valor.

Quando for explicitamente implementada em fase posterior, a injeção ocorrerá no processo filho com referências `op://` e `op run --env-file=<arquivo-de-referencias> -- <processo>`. O adapter só poderá preparar operação allowlisted; não aceitará comando shell arbitrário.
