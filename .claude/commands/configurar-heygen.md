---
name: workshop-marketing:configurar-heygen
description: Orienta a configuração externa e não interativa do HeyGen via 1Password.
allowed-tools: Read, WebFetch, WebSearch
model: sonnet
---

# Configurar HeyGen

Esta integração usa `HEYGEN_API_KEY`. IDs não secretos, como avatar ou voz, podem ser configurados separadamente quando necessários.

1. Explique que HeyGen é opcional para vídeos com avatar.
2. Oriente o operador a registrar a chave no 1Password fora do chat.
3. Oriente a referência `op://<vault>/<item>/<field>` em `.env.op` local para `HEYGEN_API_KEY`.
4. Peça somente a confirmação de configuração no 1Password.
5. Em execução autorizada, verifique apenas disponibilidade com `op run --env-file=.env.op -- sh -c 'test -n "$HEYGEN_API_KEY"'`.

Nunca obtenha plaintext, chame a API com valor exposto ou escreva o segredo em `.env`. Consulte `docs/security/ONEPASSWORD.md` para o contrato de runtime.
