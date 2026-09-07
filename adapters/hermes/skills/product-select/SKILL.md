---
name: produto-trocar
description: Seleciona um produto local existente sem criar ou alterar seu conteúdo.
version: 1.0.0
workflow_id: product.select
mode: local
---

# Seleção de produto Hermes

Leia e aplique `adapters/hermes/SOURCE-POLICY.md`. Receba somente `product_slug`, confirme que o produto já existe e atualize `.ativo` e o manifest local. Não crie produto implicitamente, não leia secrets e não execute command Claude.

Fonte metodológica de compatibilidade: `.claude/commands/produto-trocar.md`.
