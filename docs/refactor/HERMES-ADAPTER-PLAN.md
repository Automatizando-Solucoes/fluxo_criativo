# Plano do Adapter Hermes

Status: plano, sem implementação nesta entrega.

## Escopo inicial

1. Criar `HERMES.md` curto e explícito, sem copiar todo `CLAUDE.md`.
2. Declarar `.claude/skills/` como diretório externo inicial de skills, quando a instalação Hermes permitir essa configuração.
3. Criar wrappers mínimos para `pesquisa-mercado`, `copy-social`, `copy-pagina`, `copy-anuncio`, `carrossel`, `criativo-estatico` e `trafego-insights`.
4. Definir interface de cron, sem substituir `/schedule`.
5. Usar gateway Hermes para notificações de aprovação antes de criar integração própria com Telegram/WhatsApp.

## Prioridade de contexto

`HERMES.md` será a entrada explícita. Ele apontará para `AGENTS.md` e `CLAUDE.md` como referências de compatibilidade, sem depender de qual deles Hermes carregue automaticamente. Estado de negócio sempre vem de `meus-produtos/{slug}/`; memória Hermes armazena apenas preferências e decisões recorrentes não críticas.

## Mapa de agentes

| Classe | Agentes |
|---|---|
| `INTERACTIVE_MAIN` | `estrategista-de-produto`, `estrategista-low-ticket`, `estrategista-middle-ticket`, `estrategista-ht`, `executor-de-plano-de-acao`, `copywriter`, `construtor-de-paginas`, `criador-de-campanhas`, `consultor-comercial` |
| `DELEGATE` | `pesquisa-mercado`, `revisor-pesquisa`, `revisor-perfil`, `revisor-idconsumidor`, `gerador-decorados`, `gerador-urgencias-ocultas`, `gerador-idconsumidor`, `clonador-de-bloco-visual` |
| `UTILITY` | `video-maker` e adaptadores de asset/relatório quando não fazem entrevista |
| `LEGACY` | referências C10X `/ht-*` até a dependência externa ser resolvida |

## Cron e aprovações

Todo cron agenda um job neutro com entrada, saída esperada, idempotency key e destino de aprovação. O adapter Hermes apenas traduz o job para o agendador. Pesquisa, pauta, copy, revisão e assets podem ser automáticos; publicação, mensagens externas e ações Meta ficam bloqueadas até aprovação. A fila é a futura `core/approvals/` com estados `draft`, `generated`, `reviewed`, `approved`, `scheduled`, `publishing`, `published` e `failed`.

## MCP, gateway e segredos

Meta, imagem, vídeo, pesquisa e CRM serão interfaces de integração. Hermes MCP/gateway pode implementá-las, mas workflows não chamam namespaces específicos. Segredos entram por secret store, OAuth, MCP ou `.env` local provisionado fora do chat; logs exibem apenas valores mascarados.
