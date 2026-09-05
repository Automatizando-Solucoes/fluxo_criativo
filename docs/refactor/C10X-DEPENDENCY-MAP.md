# Mapa de Dependência C10X / High Ticket

Base estática: o repositório possui o orquestrador `estrategista-ht` e diversas referências `/ht-*`, porém não possui command ou skill física com esses nomes. Não foi inventada nenhuma implementação.

| Referência | Papel indicado pelo orquestrador | Estado | Evidência |
|---|---|---|---|
| `ht-big-idea` | promessa/mote do evento | EXTERNAL_MISSING | referência em `estrategista-ht` |
| `ht-cronograma` | agenda e blocos do evento | EXTERNAL_MISSING | referência em `estrategista-ht` |
| `ht-pagina-inscricao` | página de inscrição | EXTERNAL_MISSING | referência em agentes/páginas |
| `ht-anuncios` | captação do evento | EXTERNAL_MISSING | referência em campanhas/copy |
| `ht-comunicacao-pre` | comunicação pré-evento | EXTERNAL_MISSING | referência no mapa de status |
| `ht-conteudo` | conteúdo do evento | EXTERNAL_MISSING | referência no mapa de status |
| `ht-pitch-palco` | pitch de palco | EXTERNAL_MISSING | referência em agentes |
| `ht-oferta` | estrutura da oferta | EXTERNAL_MISSING | referência no mapa de status |
| `ht-follow-up` | follow-up | EXTERNAL_MISSING | referência em agentes |
| `ht-diagnostico` | roteiro de diagnóstico | EXTERNAL_MISSING | referência em consultor comercial |
| `ht-spin` | SPIN Selling | EXTERNAL_MISSING | referência em consultor comercial |
| `ht-proposta` | proposta comercial | EXTERNAL_MISSING | referência em agentes |
| `ht-apresentacao-proposta` | apresentação de proposta | EXTERNAL_MISSING | mapa no status writer |
| `ht-fechamento` | fechamento | EXTERNAL_MISSING | referência em consultor comercial |
| `ht-objecoes` | objeções | EXTERNAL_MISSING | mapa no status writer |
| `ht-whatsapp` | fluxo WhatsApp | EXTERNAL_MISSING | mapa no status writer |
| `ht-onboarding` | onboarding | EXTERNAL_MISSING | mapa no status writer |
| `ht-repitch` | repitch | EXTERNAL_MISSING | mapa no status writer |

## Classificação complementar

| Classe | Componentes |
|---|---|
| `INTERNAL` | `estrategista-ht.md`, referências de roteamento em `consultor-comercial`, `copywriter`, `criador-de-campanhas`, `executor-de-plano-de-acao` e status writer |
| `EXTERNAL_AVAILABLE` | Não verificável estaticamente neste checkout. |
| `EXTERNAL_MISSING` | Todas as referências `/ht-*` listadas acima. |
| `BROKEN` | Nenhum arquivo interno quebrado foi executado para afirmar quebra; toda invocação local de `/ht-*` permanece não resolvida até instalar/configurar o plugin fonte. |

## Decisão de migração

Preservar o roteamento e marcar a dependência no adapter. Antes de transformar High Ticket em core neutro, obter a fonte licenciada das skills ou uma especificação autorizada, mapear seus contratos e adicionar testes de regressão. Não substituir por conteúdo aproximado.
