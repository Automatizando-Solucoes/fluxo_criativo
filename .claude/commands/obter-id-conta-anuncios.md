---
name: workshop-marketing:obter-id-conta-anuncios
description: Localiza e persiste a configuração não secreta META_AD_ACCOUNT_ID.
allowed-tools: Read, Write
model: sonnet
user-invocable: false
---

# Selecionar conta Meta Ads

Oriente o operador a localizar a conta em Meta Business Settings. O ID é configuração não secreta: aceite apenas dígitos, removendo o prefixo `act_` quando existir.

Se houver uma única conta retornada por `meta.accounts.list`, ela pode ser apresentada para confirmação. Se houver várias, apresente os IDs, nomes, status e moeda retornados pelo descriptor e peça a seleção do operador.

Persista somente `META_AD_ACCOUNT_ID` na configuração do produto ou do workflow. Não leia ou edite `.env`, não grave aliases históricos e nunca solicite, copie ou associe token ao ID da conta.

`FB_AD_ACCOUNT_ID` e `AD_ACCOUNT_ID` são `LEGACY_ALIAS` apenas para compatibilidade interna do adapter.
