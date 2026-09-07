---
name: criativo-estatico
description: Estrutura um briefing de criativo estático com contexto de produto.
version: 1.0.0
workflow_id: creative.static
mode: dry_run
---

# Criativo estático (Hermes wrapper)

Leia e aplique `adapters/hermes/SOURCE-POLICY.md` antes de consultar qualquer fonte Claude.

1. Resolva `creative.static` e exija `product_slug` e `brief`.
2. Consulte o perfil e a pesquisa locais quando existirem.
3. Use `.claude/commands/criativo-estatico.md` e suas referências somente para metodologia, formatos, briefing e prompt visual.
4. Persista briefing/prompt local quando solicitado; `image.generate` é boundary separado.

`image.generate` é externo. Não gere imagem, não leia segredo e não acione provider. Retorne descriptor `dry_run`; um mock não comprova provider live.
