---
name: imagem-gerar
description: Prepara geração de imagem allowlisted em dry-run e grava somente mock local.
version: 1.0.0
workflow_id: image.generate
mode: dry_run
---

# Imagem Hermes

Leia e aplique `adapters/hermes/SOURCE-POLICY.md`. Aceite apenas `openrouter` ou `freepik`, valide prompt e trate o secret lógico pelo SecretProvider. Prepare descriptor de `image.generate` ou grave artefato mock local. Não chama provider, não lê plaintext e não trata mock como validação live.
