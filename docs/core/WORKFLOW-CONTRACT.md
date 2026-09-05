# Contrato de workflow

Um workflow é identificado por um ID estável e descreve intenção, dependências e limites sem exigir um runtime específico. O registry da Fase I é descritivo: ele não executa a origem legada.

## Campos

| Campo | Descrição |
| --- | --- |
| `id` | Identificador lógico único, por exemplo `copy.social`. |
| `version` | Versão inteira do contrato. |
| `category` | Domínio funcional curto, como `copy` ou `research`. |
| `inputs` | Entradas nomeadas e se são obrigatórias. |
| `outputs` | Tipos lógicos de artefato esperados. |
| `requires` | Dados ou artefatos que precisam existir antes da execução. |
| `capabilities` | Capacidades neutras necessárias, sem nome de provider. |
| `side_effects` | Indicadores explícitos de efeitos externos e financeiros. |
| `approval` | Necessidade padrão de aprovação para a intenção descrita. |
| `source` | Origem atual usada por adapter de compatibilidade; não é executada pelo core. |

## Exemplo

```js
{
  id: 'copy.social',
  version: 1,
  category: 'copy',
  inputs: { product_slug: { required: true } },
  outputs: ['content_file'],
  requires: ['product.profile', 'product.research'],
  capabilities: ['filesystem.read', 'filesystem.write'],
  side_effects: { external: false, financial: false },
  approval: { required: false },
  source: { kind: 'claude.command', path: '.claude/commands/copy-social.md' }
}
```

O contrato não contém prompts, tokens, nomes de provider ou instruções específicas de `Skill`, `Agent`, `Task` ou `/schedule`.
