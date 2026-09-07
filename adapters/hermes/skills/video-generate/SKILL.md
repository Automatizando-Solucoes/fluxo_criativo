---
name: video-gerar
description: Prepara render de vídeo em dry-run e grava apenas resultado mock local.
version: 1.0.0
workflow_id: video.generate
mode: dry_run
---

# Vídeo Hermes

Leia e aplique `adapters/hermes/SOURCE-POLICY.md`. `ffmpeg` e `remotion` produzem somente plano de comando dry-run. `heygen` e `replicate` usam SecretProvider apenas para descriptor. O resultado local é mock e não representa render ou provider validado.
