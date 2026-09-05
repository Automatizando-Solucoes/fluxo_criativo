---
name: workshop-marketing:configurar-imagens
description: Orienta a configuração externa e não interativa de imagens via 1Password.
allowed-tools: Read, WebFetch, WebSearch
model: sonnet
---

# Configurar Geração de Imagens

Esta integração usa `OPENROUTER_API_KEY`; o modelo de imagem pode continuar sendo uma configuração não secreta.

1. Explique que a API é opcional e que o modo de prompt continua disponível sem provider.
2. Oriente o operador a guardar a credencial no 1Password fora da conversa.
3. Oriente a referência `op://<vault>/<item>/<field>` em `.env.op` local para `OPENROUTER_API_KEY`.
4. Peça somente confirmação de configuração no 1Password.
5. Em execução autorizada, faça apenas a verificação booleana: `op run --env-file=.env.op -- sh -c 'test -n "$OPENROUTER_API_KEY"'`.

Não solicite chave, não faça requisição de teste e não escreva valor em arquivo. Consulte `docs/security/ONEPASSWORD.md`.
