# Produto e VTSD no Claude Code

`/produto-novo` e `/produto-trocar` permanecem os pontos de entrada compatíveis do Claude Code. O contrato local em `adapters/claude/product-workflow.js` torna verificáveis os limites de filesystem que esses commands devem respeitar.

## Invariantes

- O slug usa o validador de `core/state/product-state.js`; caminhos relativos, traversal e nomes fora do padrão são recusados.
- Um produto existente nunca é sobrescrito silenciosamente.
- A seleção somente aceita um diretório de produto existente e grava `meus-produtos/.ativo`.
- Todos os writes ficam abaixo de `meus-produtos/{slug}/`, com exceção controlada de `.ativo` e `meus-produtos/index.js`.
- A criação inicial preserva o formato existente: `nome.txt`, `tipo.md`, `preco.md` e os diretórios de entrega já esperados por commands e painel.
- Depois de criar ou selecionar, o manifesto local do painel é atualizado. Ele não abre navegador, faz rede nem executa scripts externos.

## Cadeia VTSD

Depois da criação/seleção, `/produto-concepcao` continua responsável por conduzir pesquisa, perfil, identidade, preço, argumentos e entregas no formato atual. Os revisores de pesquisa, perfil e identidade permanecem integrados como fontes de compatibilidade. O contrato não copia nem reescreve a metodologia VTSD.

Os testes usam um diretório temporário: nenhum produto real, painel real, provider ou credencial é acessado.
