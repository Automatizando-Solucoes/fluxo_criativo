# 1Password como Secret Provider

## Arquitetura

O core futuro usa o contrato conceitual `SecretProvider -> 1PasswordSecretProvider`. Ele expõe `has_secret(name)`, `secret_reference(name)` e `run_with_secrets(command, required_secrets)`. Não existe `get_secret(name)` que devolva plaintext ao modelo.

Referências seguem `op://<vault>/<item>/<field>`. O modelo pode conhecer a referência, variável e status de disponibilidade, mas não lê valores.

## Injeção em runtime

`.env.op` local contém somente referências e é ignorado pelo Git. Use o modelo:

```bash
op run --env-file=.env.op -- <processo>
```

Scripts continuam consumindo variáveis de ambiente existentes. A injeção ocorre apenas no processo filho. Uma verificação permitida produz somente sucesso ou falha, por exemplo `test -n "$REPLICATE_API_TOKEN"`; nunca imprima variável.

## Hermes e VPS

Para execução unattended, use uma Service Account dedicada ao Fluxo Criativo, com acesso apenas aos vaults necessários, menor privilégio e read-only quando o processo apenas consome segredo. Habilite Activity Log, rotação e revogação centralizada. `OP_SERVICE_ACCOUNT_TOKEN` é bootstrap do host/runtime: nunca entra em repositório, `.env.op`, chat ou documentação como valor. Seu provisionamento não é implementado nesta fase.

## Rotação e auditoria

Rotacione no 1Password, mantenha referências estáveis quando possível e revogue acesso da Service Account quando necessário. Investigue uso por Activity Log. Toda integração externa continua sujeita a approval gates e não deve revelar material de autenticação ao LLM.
