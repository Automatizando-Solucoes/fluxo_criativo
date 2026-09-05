---
name: workshop-marketing:configurar-replicate
description: Orienta a configuração externa e não interativa do Replicate via 1Password.
allowed-tools: Read, WebFetch, WebSearch
model: sonnet
---

# Configurar Replicate

Esta integração opcional de image-to-video usa `REPLICATE_API_TOKEN`.

1. Explique o provider e o custo potencial, sem iniciar uso pago.
2. Oriente o operador a armazenar a credencial no 1Password fora do chat.
3. Oriente a referência `op://<vault>/<item>/<field>` em `.env.op` local para `REPLICATE_API_TOKEN`.
4. Peça somente confirmação de configuração no 1Password.
5. Em execução autorizada, verifique apenas disponibilidade com `op run --env-file=.env.op -- sh -c 'test -n "$REPLICATE_API_TOKEN"'`.

Não receba, exiba, inclua em header ou use a credencial em argumento. Consulte `docs/security/ONEPASSWORD.md`.
