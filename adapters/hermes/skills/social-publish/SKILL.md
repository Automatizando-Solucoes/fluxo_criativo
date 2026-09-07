---
name: social-publicar
description: Cria e avalia PublicationRequest sem publicar em plataforma externa.
version: 1.0.0
workflow_id: social.publish
mode: blocked_external
---

Leia `adapters/hermes/SOURCE-POLICY.md`. Use conteúdo social e carrossel somente como metodologia de artefato. Gerar conteúdo não é publicar conteúdo. A request exige ApprovalPolicy, mas mesmo com approval válida permanece bloqueada até existir adapter oficial. Preserve `autopublish:false` por padrão e ofereça apenas handoff manual seguro.
