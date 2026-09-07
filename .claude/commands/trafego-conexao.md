---
name: workshop-marketing:trafego-conexao
description: Configura a rota lógica Meta Ads sem expor credenciais.
allowed-tools: Read
---

# Conexão Meta Ads

Escolha apenas a rota não secreta `META_AUTH_MODO`:

- `MCP_CONECTOR`: o conector administra seu próprio OAuth; o modelo não recebe token.
- `APP`: o operador gera a credencial na UI Meta e a provisiona diretamente no 1Password como `META_ACCESS_TOKEN`.

Para APP, confirme somente a disponibilidade lógica de `META_ACCESS_TOKEN`. Em seguida, use descriptors dry-run `meta.auth.validate` e `meta.accounts.list`. Quando houver uma conta escolhida, persista apenas `META_AD_ACCOUNT_ID`, que não é segredo.

`FB_ACCESS_TOKEN_PERMANENTE`, `FB_ACCESS_TOKEN_TEMPORARIO`, `ACCESS_TOKEN`, `FB_AD_ACCOUNT_ID` e `AD_ACCOUNT_ID` são `LEGACY_ALIAS`; não são fonte canônica, não devem receber cópia de valores e não autorizam escrita, ativação ou orçamento. Nenhuma operação de conexão concede ApprovalPolicy para campanha.

Não leia `.env` como fonte de segredo, não receba token, não use query string e não execute rede nesta fase.
