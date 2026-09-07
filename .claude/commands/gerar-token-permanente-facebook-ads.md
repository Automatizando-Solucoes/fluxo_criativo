---
name: workshop-marketing:gerar-token-permanente-facebook-ads
description: Orienta o provisionamento manual de acesso Meta Ads no 1Password, sem receber ou manipular o token.
allowed-tools: Read, WebFetch, WebSearch
---

# Provisionar acesso Meta Ads

Use a interface do Meta Business para criar o usuário do sistema, atribuir os ativos necessários e conceder somente as permissões requeridas. Gere o token diretamente na interface Meta.

Quando ele for exibido, informe ao operador: salve o token diretamente no item Meta do 1Password configurado pelo operador. Não cole o valor nesta conversa. O projeto usa somente o secret lógico `META_ACCESS_TOKEN`.

## Configuração e compatibilidade

- `META_ACCESS_TOKEN` é o único nome canônico de secret.
- `META_AD_ACCOUNT_ID` é configuração não secreta.
- `FB_ACCESS_TOKEN_PERMANENTE`, `FB_ACCESS_TOKEN_TEMPORARIO`, `ACCESS_TOKEN`, `FB_AD_ACCOUNT_ID` e `AD_ACCOUNT_ID` são aliases legados; não copie nem grave valores entre eles.
- `META_AUTH_MODO` e `RELATORIO_AUTH_MODO` podem permanecer como configuração de compatibilidade, mas não autorizam plaintext.

## Operações futuras, sem execução

- `meta.auth.validate`, secret requerido: `META_ACCESS_TOKEN`.
- `meta.accounts.list`, secret requerido: `META_ACCESS_TOKEN`.

As operações usam `SecretProvider` e runtime injection. Não use token em URL, query string, shell, terminal, prompt, Markdown ou arquivo temporário. Nenhuma chamada de rede é executada por este command.

Se a conta não aparecer na listagem futura, revise na UI Meta a atribuição do ativo, permissões do usuário do sistema e o ID não secreto em `META_AD_ACCOUNT_ID`.
