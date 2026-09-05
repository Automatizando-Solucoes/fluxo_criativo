# Auditoria de Hooks Ativos e de Compatibilidade

Data da auditoria: 2026-09-05. A classificação é estática e não executou hooks. Hooks ativos obedecem à política: leitura/validação local e escrita local limitada; sem rede, instalação, privilégio, segredo, `.env`, credenciais globais, telemetria ou side effects externos.

| Hook | Classe | Situação e decisão |
|---|---|---|
| `setup-node.sh` | REMOVE | Removido no Lote 1: instalava runtime em SessionStart. |
| `agent-status-writer.js` | REWRITE | Continua ativo temporariamente para o painel local; no Lote 4 perderá leitura de `.env` e POST remoto. |
| `copy-review.js` | KEEP | Validação local de copy escrita; sem chamada externa identificada. |
| `no-emdash-guard.js` | KEEP | Bloqueio local de regra editorial. |
| `painel-validar.js` | KEEP | Validação local de artefato/painel. |
| `gsd-check-update.js` | DISABLE | Consulta `npm view` em background; preservado como compatibilidade, não ativo. |
| `gsd-context-monitor.js` | DISABLE | Depende de bridge/statusline GSD e arquivos temporários; preservado como compatibilidade opcional. |
| `gsd-phase-boundary.sh` | DISABLE | Guarda de fluxo GSD; não é requisito de negócio. |
| `gsd-prompt-guard.js` | DISABLE | Guarda GSD; não é requisito de negócio. |
| `gsd-read-guard.js` | DISABLE | Guarda GSD; não é requisito de negócio. |
| `gsd-session-state.sh` | DISABLE | Estado GSD opcional em SessionStart; não é requisito de negócio. |
| `gsd-statusline.js` | DISABLE | Statusline específico do runtime/GSD; não é requisito de negócio. |
| `gsd-validate-commit.sh` | DISABLE | Validação GSD de commit; não é requisito de negócio. |
| `gsd-workflow-guard.js` | DISABLE | Guarda GSD; não é requisito de negócio. |

## Hooks ativos após o Lote 3

- `copy-review.js` em `PostToolUse` para `Write|Edit`.
- `painel-validar.js` em `PostToolUse` para `Write|Edit|MultiEdit`.
- `agent-status-writer.js` em `PostToolUse` enquanto aguarda a reescrita local-only do Lote 4.
- `no-emdash-guard.js` em `PreToolUse` para `Write|Edit`.

Os arquivos GSD continuam no repositório como compatibilidade desativada. Para reativá-los no futuro, será necessária revisão individual de segurança e configuração explícita fora da lógica de negócio.
