---
name: copy-ad
workflow_id: copy.ad
mode: dry_run
---

# Copy de anúncio (Hermes wrapper)

1. Resolva `copy.ad` e exija `product_slug` e `offer`.
2. Use artefatos locais de perfil, pesquisa e consumidor quando existirem.
3. Consulte `.claude/commands/copy-anuncio.md`, `anuncios` como `HERMES_WRAPPER`, e `revisora`/Manual da Copy como referências metodológicas.
4. Respeite capabilities e `ApprovalPolicy`.

Não crie campanha, não leia Ads, não envie conteúdo e não execute provider. A saída desta fase é apenas plano local `dry_run`.
