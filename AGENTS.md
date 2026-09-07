# Codex entrypoint

Este arquivo é a entrada específica do Codex para o Fluxo Criativo. Ele não é
uma cópia da metodologia nem um executor de commands Claude.

## Fontes de verdade

1. `agents/README.md`: biblioteca neutra de metodologia e políticas.
2. `agents/policies/`: segurança, segredo, approval e proveniência.
3. `core/workflows/registry.js`: workflows canônicos e seus riscos.
4. `core/`: contratos de negócio, estado local, orchestration e boundaries.
5. `adapters/codex/`: glue Codex fino, sem dependência de outros adapters.

`CLAUDE.md` e `HERMES.md` são entrypoints dos seus próprios runtimes.
`.claude/` permanece como UX e compatibilidade do Claude, não como fonte
metodológica canônica do Codex.

## Resolução de trabalho

1. Resolva a intenção pelo registry canônico.
2. Leia somente a metodologia relevante em `agents/` e a policy aplicável.
3. Use o contrato `core/` e, quando necessário, o adapter Codex.
4. Para estado de produto, use somente
   `meus-produtos/{slug}/`, com `.ativo` e `index.js` como exceções controladas.
5. Trate aliases, como `traffic.insights`, como compatibilidade explicitamente
   definida pelo resolver. Nunca crie uma segunda implementação.

## Segurança

- 1Password é a fonte de segredos. O modelo conhece apenas nome lógico e
  disponibilidade. Nunca pede, lê, registra, mostra ou registra valor plaintext.
- Não use `op`, `.env` como SecretProvider, shell arbitrário, URL com segredo
  ou argumento de processo com credencial.
- Providers, MCP, publicação, notificação, deploy, cron e delegates passam por
  contratos e gates. Nesta base, os workflows externos são dry-run/mock salvo
  indicação explícita e aprovada em outro contexto.
- `ApprovalPolicy` não é implícita. WRITE exige a policy aplicável;
  `FINANCIAL_WRITE` exige grant manual exato por `action_id`.
- Nova campanha Meta inicia `PAUSED`. `social.publish` permanece bloqueado sem
  adapter oficial. High Ticket permanece bloqueado sem dependências `ht-*`.

## Limites de runtime

Codex não executa `.claude/commands/*.md` como mecanismo operacional e não
importa `adapters/claude` ou `adapters/hermes`. Claude e Hermes seguem a mesma
regra em sentido inverso. Todos convergem por `agents/` e `core/`.

## Leitura adicional

- [Biblioteca compartilhada](agents/README.md)
- [Política de proveniência](agents/policies/source-policy.md)
- [Arquitetura](ARQUITETURA.md)
- [Matriz Codex](docs/codex/PARITY-MATRIX.md)
