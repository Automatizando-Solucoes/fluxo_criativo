---
name: workshop-marketing:configurar-apify
description: Orienta a configuração externa e não interativa do Apify via 1Password.
allowed-tools: Read, WebFetch, WebSearch
model: sonnet
---

# Configurar Apify

Esta integração usa a variável `APIFY_API_TOKEN` e o 1Password é a fonte de verdade do segredo.

1. Explique a finalidade do Apify para pesquisa e dashboards.
2. Oriente o operador a criar ou atualizar a credencial no 1Password fora desta conversa.
3. Oriente o operador a registrar uma referência `op://<vault>/<item>/<field>` para `APIFY_API_TOKEN` em `.env.op` local, baseado em `.env.op.example`.
4. Peça somente a confirmação: “já configurei no 1Password”.
5. Quando houver autorização operacional, verifique disponibilidade sem revelar valor, usando `op run --env-file=.env.op -- sh -c 'test -n "$APIFY_API_TOKEN"'`.
6. Relate apenas configurado ou indisponível. Não leia, imprima, copie, teste contra API ou grave o segredo.

Se o runtime não tiver 1Password configurado, interrompa a integração e aponte para `docs/security/ONEPASSWORD.md`.
