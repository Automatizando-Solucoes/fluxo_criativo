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
| `side_effects` | Indicadores explícitos de interação externa e efeito financeiro. |
| `kind` | `atomic` ou `composite`. |
| `risk_from_children` | Obrigatório para workflow composto; impede assumir risco apenas pelas flags estáticas. |
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
  kind: 'atomic',
  risk_from_children: false,
  approval: { required: false },
  source: { kind: 'claude.command', path: '.claude/commands/copy-social.md' }
}
```

O contrato não contém prompts, tokens, nomes de provider ou instruções específicas de `Skill`, `Agent`, `Task` ou `/schedule`.

`side_effects.external` é `true` quando o workflow exige qualquer interação com sistema fora do projeto local, inclusive leitura, pesquisa ou geração em provider. `side_effects.financial` é `true` quando ele pode alterar gasto, orçamento, pagamento ou outro recurso financeiro. Um workflow `composite` com `risk_from_children: true` não pode ser tratado como seguro só porque uma parte estática parece local: o adapter precisa resolver e avaliar os filhos antes de executar.
