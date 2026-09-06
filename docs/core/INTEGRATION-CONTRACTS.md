# Contratos de integrações externas

O core descreve capacidade, e não provider. Nesta fase não há cliente, API, token ou execução externa.

| Capacidade | Contrato lógico | Side effect esperado |
| --- | --- | --- |
| `image.generate` | `ImageProvider` | não, até persistir artefato local |
| `video.generate` | `VideoProvider` | não, até persistir artefato local |
| `ads.insights` | `AdsProvider` | não para leitura de insights |
| `research.fetch` | `ResearchProvider` | não para pesquisa/leitura |
| `notification.send` | `NotificationProvider` | sim |
| `publisher.publish` | `PublisherProvider` | sim |

Cada adapter futuro escolhe o provider concreto fora do core e passa por políticas de segredo, approval e side effects. Não existe uma classe universal de provider: cada capacidade declara suas próprias entradas e saídas.

Qualquer workflow que declare uma capability desta tabela precisa declarar `side_effects.external: true`, inclusive para leitura ou pesquisa. Isso descreve interação fora do projeto, não a necessidade automática de aprovação manual: a policy poderá permitir leituras ou pesquisas recorrentes com standing approval em escopo apropriado.
