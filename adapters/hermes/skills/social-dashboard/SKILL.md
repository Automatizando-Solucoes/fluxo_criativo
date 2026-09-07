---
name: social-dashboard
description: Prepara dashboard social normalizado em dry-run com cache mock local.
version: 1.0.0
workflow_id: social.dashboard
mode: dry_run
---

# Dashboard social Hermes

Leia e aplique `adapters/hermes/SOURCE-POLICY.md`. Aceite `instagram`, `tiktok`, `youtube` ou `linkedin`. Apify é somente boundary `research.fetch` com SecretProvider. Gere descriptor ou cache mock normalizado, preservando cache existente em erro. Não chama provider nem expõe segredo.
