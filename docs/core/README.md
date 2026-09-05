# Core neutro de runtime

O diretório `core/` contém contratos pequenos e testáveis entre a inteligência já existente, workflows lógicos, estado local e runtimes. Ele não substitui nem move, nesta fase, `.claude/agents/`, `.claude/commands/` ou `.claude/skills/`.

## O que é

- identificadores e metadados de workflow;
- política de aprovação serializável;
- contratos para segredos, scheduling, integrações e estado de produto;
- limites explícitos que adapters de Claude, Hermes e Codex poderão implementar.

## O que não é

Não é um executor de agentes, publisher, scheduler real, banco de dados, serviço HTTP, nem uma reescrita de metodologias. Não acessa APIs, vaults, credenciais ou recursos externos.

## Uso pelos runtimes

Um runtime resolve um `workflow_id` no registry e traduz sua origem atual para a superfície compatível. Nesta fase os adapters apenas descrevem a resolução; não acionam commands, skills ou agents.

## Estado, approvals e segredos

`meus-produtos/{slug}/` continua sendo a fonte de verdade do negócio. A camada de estado apenas valida e resolve caminhos conhecidos. Aprovações usam `manual`, `standing` ou `disabled`. Segredos são referências e disponibilidade: valores plaintext não pertencem ao contrato nem ao contexto do modelo.
