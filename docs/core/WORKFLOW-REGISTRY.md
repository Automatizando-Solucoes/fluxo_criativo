# Registry inicial de workflows

O registry liga intenção lógica à origem atual apenas para compatibilidade. Ele não lê, chama ou modifica essa origem.

| Workflow ID | Origem atual | Dependência de runtime |
| --- | --- | --- |
| `research.market` | `pesquisa-mercado` | skill Claude atual; usa pesquisa externa, ainda sem adapter. |
| `copy.page` | `copy-pagina` | command Claude atual. |
| `copy.ad` | `copy-anuncio` | command Claude atual. |
| `copy.social` | `copy-social` | command Claude atual. |
| `creative.static` | `criativo-estatico` | command Claude atual; geração em provider externo. |
| `traffic.insights` | `trafego-insights` | command Claude atual; leitura de Ads é interação externa. |
| `toolkit.execute` | `toolkit-executar` | workflow composto, com risco herdado dos filhos; não é local-only. |

Cada entrada também descreve entradas, saídas, capacidades, efeitos e necessidade de aprovação. Um ID desconhecido falha explicitamente; o registry não faz fallback para texto, command ou skill arbitrário.

`toolkit.execute` não é executável pelo core nesta fase. Seus adapters recebem `requires_child_risk_resolution: true`, devendo resolver riscos, approval e efeitos de cada filho antes de qualquer execução futura.
