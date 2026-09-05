# Decisões técnicas do core neutro

## Linguagem executável

Os contratos de referência da Fase I usam JavaScript CommonJS, executável pelo Node.js já utilizado pelos hooks e testes locais do repositório. A escolha permite validar contratos sem dependências novas, bundlers ou serviços.

Os formatos de contrato continuam sendo objetos serializáveis. Claude Code, Hermes e Codex não precisam interpretar JavaScript para entender os documentos; os adapters futuros podem consumir o mesmo formato em outra linguagem quando necessário.

## Alternativas consideradas

- **Python:** já existe em scripts de integrações, mas os testes e hooks de segurança existentes usam Node. Usar duas linguagens para contratos nesta fase aumentaria a superfície sem benefício imediato.
- **TypeScript:** traria compilador, configuração e dependências adicionais que não são necessários para contratos pequenos.
- **YAML somente:** é útil como documentação, mas não fornece validação executável com a mesma clareza para os testes locais.

## Dependências

Nenhuma dependência foi adicionada. A implementação usa somente módulos padrão do Node.js, em especial `node:assert`, `node:fs`, `node:path` e `node:os` nos testes.

## Limite da decisão

Node não passa a ser pré-requisito da inteligência de marketing nem do estado em `meus-produtos/`. Ele é apenas o runtime de referência para os contratos executáveis desta fase. Nenhum workflow legado é executado por este core.
