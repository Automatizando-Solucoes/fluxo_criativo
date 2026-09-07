---
name: produto-novo
description: Cria um produto local com estado e entregas iniciais seguros.
version: 1.0.0
workflow_id: product.create
mode: local
---

# Produto novo Hermes

Leia e aplique `adapters/hermes/SOURCE-POLICY.md` antes de consultar fontes Claude.

Receba `product_slug`, `name`, `type` e `price`. Use somente o contrato local Hermes para validar slug e tipo, impedir sobrescrita, criar a estrutura em `meus-produtos/{slug}/`, atualizar `.ativo` e regenerar o manifest local. Não execute command Claude, não leia secrets e não escreva fora de `meus-produtos/`.

Fonte metodológica de compatibilidade: `.claude/commands/produto-novo.md`.
