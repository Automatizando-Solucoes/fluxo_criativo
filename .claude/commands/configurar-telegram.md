---
name: workshop-marketing:configurar-telegram
description: Orienta a configuração externa e não interativa de notificações Telegram via 1Password.
allowed-tools: Read, WebFetch, WebSearch
model: sonnet
---

# Configurar Telegram

Notificações usam `TELEGRAM_BOT_TOKEN`; o chat ID é identificador operacional e deve seguir a política local de dados do produto.

1. Explique que Telegram é um canal opcional de notificação.
2. Oriente o operador a guardar o bot token no 1Password fora da conversa.
3. Oriente a referência `op://<vault>/<item>/<field>` em `.env.op` local para `TELEGRAM_BOT_TOKEN`.
4. Peça somente confirmação de configuração no 1Password.
5. Em execução autorizada, verifique somente presença com `op run --env-file=.env.op -- sh -c 'test -n "$TELEGRAM_BOT_TOKEN"'`.

Não envie mensagem de teste, não use URL de API e não revele o token. Consulte `docs/security/ONEPASSWORD.md`.
