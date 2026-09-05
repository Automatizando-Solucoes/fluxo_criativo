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
