# Integridade de commands Claude

O teste `tests/claude/command-integrity.test.js` percorre recursivamente `.claude/commands/` e valida referências locais estruturadas: caminhos explícitos em código para `.claude/skills/`, `.claude/agents/`, `.claude/commands/`, `scripts/`, `painel/` e `assets/`, além de links Markdown nesses mesmos formatos.

As classificações são `VALID`, `LEGACY`, `BLOCKED_EXTERNAL` e `MISSING`. Dependências `ht-*` são `BLOCKED_EXTERNAL`; `Skill(...)`, `Agent(...)` e `Task(...)` declarativos são catalogados como referências de runtime legado até terem adapter neutro. O teste falha somente para `MISSING`.

Limitação deliberada: ele não tenta deduzir referências a partir de linguagem natural ou de todo texto com barra, para não converter endpoints, exemplos e conteúdo editorial em caminhos locais. Referências não estruturadas continuam cobertas por revisão e pelos testes de workflow.

O relatório é emitido pelo próprio teste e inclui total de commands, referências válidas, legadas, externas bloqueadas e ausentes. O estado exigido para este ramo é: `missing=0`; os contadores de fluxos canônicos Z-API e secrets Meta são verificados separadamente por `uazapi-migration.test.js` e `meta-secret-command-integrity.test.js`.

## Última execução aprovada

`113` commands auditados, `121` referências válidas, `15` referências legadas, `0` externas bloqueadas e `0` ausentes. Os testes de migração confirmam `0` fluxos canônicos Z-API e `0` fluxos canônicos Meta com secret inseguro. Reexecute os testes para atualizar estes números quando commands forem adicionados.
