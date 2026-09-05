# Registry inicial de workflows

O registry liga intenção lógica à origem atual apenas para compatibilidade. Ele não lê, chama ou modifica essa origem.

| Workflow ID | Origem atual | Dependência de runtime |
| --- | --- | --- |
| `research.market` | `pesquisa-mercado` | skill Claude atual; pesquisa será traduzida por adapter futuro. |
| `copy.page` | `copy-pagina` | command Claude atual. |
| `copy.ad` | `copy-anuncio` | command Claude atual. |
| `copy.social` | `copy-social` | command Claude atual. |
| `creative.static` | `criativo-estatico` | command Claude atual; provider de imagem permanece externo. |
| `traffic.insights` | `trafego-insights` | command Claude atual; leitura de Ads permanece em adapter/gate futuro. |
| `toolkit.execute` | `toolkit-executar` | command Claude atual. |

Cada entrada também descreve entradas, saídas, capacidades, efeitos e necessidade de aprovação. Um ID desconhecido falha explicitamente; o registry não faz fallback para texto, command ou skill arbitrário.
