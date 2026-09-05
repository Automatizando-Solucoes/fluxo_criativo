# Distribuição Desktop Opcional

O core de marketing não depende de Electron, Node ou de um aplicativo desktop. A inteligência está nos contextos, commands, agentes, skills, scripts e estado de produto.

O `package.json` e `scripts/notarize.js` são preservados como configuração legada de distribuição. Os scripts `start`, `build` e `build:win` não foram executados nesta sanitização e não devem ser usados como evidência de uma distribuição funcional: o diretório `electron/` referido pelo manifesto não está presente no commit analisado. Qualquer recuperação futura exigirá escopo próprio, dependências explícitas e remoção de privilégios administrativos antes de distribuição.

Node só é necessário quando uma funcionalidade opcional o exige, como hooks locais compatíveis ou uma futura recuperação da distribuição desktop. Ele não é requisito para usar a metodologia, consultar a documentação ou preservar o estado de negócio.
