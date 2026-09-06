---
name: copy-anuncio
description: Orienta a criação de copy de anúncio a partir do contexto aprovado.
version: 1.0.0
workflow_id: copy.ad
mode: dry_run
---

# Copy de anúncio (Hermes wrapper)

Leia e aplique `adapters/hermes/SOURCE-POLICY.md` antes de consultar qualquer fonte Claude.

1. Resolva `copy.ad` e exija `product_slug` e `offer`.
2. Use artefatos locais de perfil, pesquisa e consumidor quando existirem.
3. Consulte `.claude/commands/copy-anuncio.md`, `anuncios` como `HERMES_WRAPPER`, e `revisora`/Manual da Copy como referências metodológicas.
4. Respeite capabilities e `ApprovalPolicy`.

Não crie campanha, não leia Ads, não envie conteúdo e não execute provider. A saída desta fase é apenas plano local `dry_run`.
