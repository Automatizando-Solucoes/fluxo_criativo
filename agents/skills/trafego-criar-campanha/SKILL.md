---
name: trafego-criar-campanha
description: Metodologia neutra para planejar campanhas de Meta Ads.
---

# Criação de campanha

## Método

Planeje objetivo, evento de conversão, estrutura de campanha e conjuntos,
público, posicionamentos, criativos, orçamento, nomenclatura, rastreamento e
preview. Distingua Sales de Leads e valide coerência entre oferta, funil,
pixel, conversão e criativo antes do handoff.

Liste as leituras necessárias de conta, pixels, conversões, audiências,
interesses e criativos como necessidades de negócio, não como chamadas de
provider.

## Boundary canônico

Leituras usam operações Meta allowlisted. A criação é exclusivamente
`ads.campaign.create`: `WRITE`, approval manual por `action_id` e draft sempre
`PAUSED`. Pedido de `ACTIVE` não altera essa regra. A skill não escolhe
transport, não acessa segredo e não executa criação.

## Legado

O texto histórico misturado a runtime está em
`.claude/skills/trafego-criar-campanha/legacy-runtime/` e não é autoridade
canônica.
