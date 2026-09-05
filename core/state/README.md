# Limite de estado de produto

`meus-produtos/{slug}/` continua sendo a fonte de verdade do negócio e não é migrado para banco. Esta camada só resolve caminhos conhecidos e lê o slug ativo quando solicitado.

| Função | Responsabilidade |
| --- | --- |
| `get_active_product()` | Lê `meus-produtos/.ativo`; retorna `null` se ausente ou vazio. |
| `get_product_path(slug)` | Valida slug e resolve a pasta do produto. |
| `get_artifact_path(slug, type)` | Resolve somente artefatos conhecidos, sem aceitar caminho arbitrário. |

Slugs com traversal, separadores ou letras maiúsculas falham. A camada não escreve, renomeia, cria ou muda os formatos atuais de perfil, pesquisa, entregas ou memória de agentes.
