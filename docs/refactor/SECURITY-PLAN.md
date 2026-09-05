# Plano de Segurança

Este plano descreve alterações futuras. Nenhuma delas foi aplicada nesta fase.

## Achados e tratamento

| Prioridade | Achado estático | Tratamento planejado | Validação |
|---|---|---|---|
| Crítica | `setup-node.sh` instala Homebrew/Node/nvm/apt/winget, usa `sudo` e `curl | bash` em `SessionStart`. | Remover da configuração e do repositório apenas após documentar pré-requisitos. | Pesquisa textual: nenhum SessionStart instala/executa rede/admin. |
| Crítica | `agent-status-writer.js` pode ler token e fazer POST remoto para URL configurável. | Reescrever para estado estritamente local, sem `.env`, `http` ou `https`. | Teste estático de ausência de rede/`WORKSHOP_*`. |
| Alta | `settings.json` possui permissões globais de web e Bash. | Restringir por capacidades mínimas e evitar hooks de rede. | Revisão de allow-list. |
| Alta | Instalares fazem instalação automática e o Windows exige admin. | Mover para `legacy/installers/` ou retirar da distribuição ativa depois de regressão. | Nenhum caminho principal aponta para eles. |
| Média | GSD update consulta `npm view` em SessionStart e usa diretórios de usuário/cache. | Desativar/remover da configuração ativa ou tornar ação manual. | Sem subprocesso/rede em hooks. |
| Média | Fluxos de configuração instruem coleta de tokens em chat. | Atualizar para secure setup/OAuth/MCP/.env fora do chat. | Busca por expressões de coleta direta e revisão manual. |
| Média | Electron é declarado, mas o código `electron/` está ausente e o build pede admin no Windows. | Tornar opcional e remover privilégio administrativo da configuração futura. | `npm` não é requisito para core. |

## Política futura de hooks

Podem ler o projeto, validar saída e escrever estado local limitado. Não podem usar rede, instalar software, usar `sudo`/admin, ler credenciais globais ou emitir telemetria. `copy-review`, `no-emdash-guard` e `painel-validar` serão auditados individualmente antes de serem preservados. Hooks GSD serão tratados como compatibilidade opcional, não requisito funcional.

## Política de segredos e operações sensíveis

- Nunca solicitar ou registrar token em chat, commit, template ou log.
- Preferir OAuth, MCP, secret store ou `.env` provisionado localmente.
- Mascarar chaves em qualquer diagnóstico.
- `PUBLISH_MODE=dry-run` por padrão.
- Meta Ads: preview, aprovação explícita e campanha inicialmente `PAUSED`.
- Escala de gasto e publicação social exigem approval gate persistente.

## Ordem da sanitização posterior

1. `setup-node`; 2. configurações; 3. hooks; 4. telemetria; 5. segredos; 6. instaladores; 7. Electron. Uma mudança lógica por commit, com regressão do fluxo afetado.
