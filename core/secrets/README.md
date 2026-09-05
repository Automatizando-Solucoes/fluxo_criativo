# Contrato de secret provider

O core conhece apenas disponibilidade e referências de segredo. O contrato é deliberadamente pequeno:

```text
has_secret(name) -> boolean
secret_reference(name) -> op://...
run_with_secrets(operation, required_secrets) -> execução preparada
```

Não existe `get_secret(name)` nem outro método que retorne plaintext. `run_with_secrets` recebe um descritor de operação allowlisted e nomes lógicos; nesta fase o provider de teste não executa processo algum nem injeta valores.

Em uma implementação futura, o adapter do runtime fará a injeção no subprocesso por referência, sem expor o valor ao modelo ou registrá-lo em argumentos, URLs, arquivos ou logs.
