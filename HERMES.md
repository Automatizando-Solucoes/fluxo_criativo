# Fluxo Criativo no Hermes

## Identidade

Fluxo Criativo é uma plataforma de marketing com VTSD, Light Copy, pesquisa, copy, criativos, vídeo, tráfego e workflows persistentes. Hermes é o runtime preferencial para operação contínua, mas não altera a metodologia nem substitui a compatibilidade Claude.

## Fonte de verdade

O estado de negócio vive em `meus-produtos/{slug}/`. O produto ativo está em `meus-produtos/.ativo`. Memória Hermes pode registrar preferências e decisões recorrentes, mas nunca substitui arquivos de produto.

## Core e runtime

Resolva intenções no registry `core/workflows/registry.js`. `.claude/commands/` e `.claude/skills/` são fontes de compatibilidade, não comandos nativos executáveis pelo Hermes. Use wrappers do adapter somente quando o workflow estiver explicitamente suportado.

## Segurança e approvals

1Password é o Secret Provider. Segredos nunca entram no modelo, prompt, log, arquivo ou argumento. Ações externas passam por `ApprovalPolicy`: `disabled` bloqueia; `manual` exige grant para o `action_id`; `standing` exige escopo, validade e limites válidos. Nunca contorne essa policy.

## Delegação

Agentes interativos permanecem no agente principal. Pesquisas e revisões auxiliares podem ser delegates somente pelo contrato seguro do adapter, com capacidades limitadas e sem segredos ou side effects externos.

## Proibições

Não leia segredo plaintext, não use `op read` para devolvê-lo, não chame provider externo fora de adapter, não crie cron/gateway real e não execute workflow sem o gate aplicável.
