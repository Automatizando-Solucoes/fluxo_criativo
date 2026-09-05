---
name: workshop-marketing:configurar-zapi
description: Orienta a configuração externa e não interativa de notificações Z-API via 1Password.
allowed-tools: Read, WebFetch, WebSearch
model: sonnet
---

# Configurar Z-API

Esta integração opcional usa `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN` e `ZAPI_CLIENT_TOKEN`.

1. Explique o uso e o risco operacional de automações WhatsApp.
2. Oriente o operador a guardar todas as credenciais no 1Password fora do chat.
3. Oriente referências `op://<vault>/<item>/<field>` em `.env.op` local para as variáveis necessárias.
4. Peça somente confirmação de configuração no 1Password.
5. Em execução autorizada, verifique somente presença com `op run --env-file=.env.op -- sh -c 'test -n "$ZAPI_TOKEN"'`.

Não receba credenciais, não faça chamada de teste, não escreva `.env` plaintext e não envie mensagem. Consulte `docs/security/ONEPASSWORD.md`.
