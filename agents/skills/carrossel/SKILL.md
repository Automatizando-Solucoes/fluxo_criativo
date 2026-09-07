---
name: carrossel
description: Metodologia neutra para criação de carrosséis e briefing visual.
---

# Carrossel

Defina promessa, progressão de slides, gancho, legenda, CTA e um prompt visual
por slide. Use os estilos e templates metodológicos em `references/` sem
transferir autoridade de runtime. O artefato deve preservar
`publication.autopublish: false` e `publication.status: not_requested`.

`carousel.generate` produz conteúdo local. `carousel.schedule` só produz um
descriptor local dry-run. Geração de imagem, cron e publicação são boundaries
separados e não são acionados por esta metodologia.

O roteiro histórico de ferramentas está em
`.claude/skills/carrossel/legacy-runtime/` e não é canônico.
