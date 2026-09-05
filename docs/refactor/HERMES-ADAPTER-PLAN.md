# Plano do Adapter Hermes

Status: plano, sem implementação nesta entrega.

## Escopo inicial

1. Criar `HERMES.md` curto e explícito, sem copiar todo `CLAUDE.md`.
2. Classificar a compatibilidade das skills antes de avaliar um diretório externo Hermes; não carregar indiscriminadamente `.claude/skills/`.
3. Criar wrappers mínimos para `pesquisa-mercado`, `copy-social`, `copy-pagina`, `copy-anuncio`, `carrossel`, `criativo-estatico` e `trafego-insights`.
4. Definir interface de cron, sem substituir `/schedule`.
5. Usar gateway Hermes para notificações de aprovação antes de criar integração própria com Telegram/WhatsApp.

## Prioridade de contexto

`HERMES.md` será a entrada explícita. Ele conterá princípios neutros, arquitetura, fonte de verdade em `meus-produtos/`, política de segurança, política de aprovação e localização de skills/workflows. Pode citar `CLAUDE.md` como referência histórica de compatibilidade, mas não o herda nem o torna autoridade operacional Hermes: ele contém setup, APIs e regras específicas do runtime ainda sujeitos à sanitização. Estado de negócio sempre vem de `meus-produtos/{slug}/`; memória Hermes armazena apenas preferências e decisões recorrentes não críticas.

## Classificação de skills antes de diretório externo

| Classe | Critério | Tratamento inicial |
|---|---|---|
| `HERMES_NATIVE` | Skill metodológica/procedural sem dependência específica do Claude. | Pode entrar na allowlist Hermes após inspeção. |
| `HERMES_WRAPPER` | Inteligência reaproveitável, mas com tools, commands ou suposições de runtime Claude. | Expor apenas via wrapper/adaptador. |
| `CLAUDE_ONLY_TEMP` | Skill operacional dependente de recurso Claude ainda sem adapter. | Manter no Claude até que haja contrato e regressão. |

A primeira allowlist candidata para avaliação é: `revisora`, `elementos-literarios`, `vtsd-completo`, `concepcao-produto`, conhecimento metodológico de `anuncios` e conhecimento metodológico de `paginas`. Nenhuma entra automaticamente. Skills que manipulam `.env`, solicitam tokens, usam Bash, `/schedule`, `Skill`/`Agent` do Claude, MCP com namespace Claude ou APIs externas devem passar por wrapper/adapter primeiro.

## Mapa de agentes

| Classe | Agentes |
|---|---|
| `INTERACTIVE_MAIN` | `estrategista-de-produto`, `estrategista-low-ticket`, `estrategista-middle-ticket`, `estrategista-ht`, `executor-de-plano-de-acao`, `copywriter`, `construtor-de-paginas`, `criador-de-campanhas`, `consultor-comercial`, `video-maker` |
| `DELEGATE` | `pesquisa-mercado`, `revisor-pesquisa`, `revisor-perfil`, `revisor-idconsumidor`, `gerador-decorados`, `gerador-urgencias-ocultas`, `gerador-idconsumidor`, `clonador-de-bloco-visual` |
| `UTILITY` | Adaptadores concretos de asset, renderização, publicação e relatório que não fazem entrevista |
| `LEGACY` | referências C10X `/ht-*` até a dependência externa ser resolvida |

## Cron e aprovações

Todo cron agenda um job neutro com entrada, saída esperada, idempotency key e `ApprovalPolicy`. O adapter Hermes apenas traduz o job para o agendador. Pesquisa, pauta, copy e revisão podem usar política `standing` quando o usuário a configurar explicitamente e dentro do escopo registrado. Publicação, mensagens externas e ações Meta usam `manual` por padrão, especialmente quando financeiras ou irreversíveis. A fila é a futura `core/approvals/` com estados `draft`, `generated`, `reviewed`, `approved`, `scheduled`, `publishing`, `published` e `failed`.

## MCP, gateway e segredos

Meta, imagem, vídeo, pesquisa e CRM serão interfaces de integração. Hermes MCP/gateway pode implementá-las, mas workflows não chamam namespaces específicos. Segredos entram por secret store, OAuth, MCP ou `.env` local provisionado fora do chat; logs exibem apenas valores mascarados.
