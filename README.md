# Fluxo Criativo — Plataforma Multi-Runtime de Marketing com IA

O **Fluxo Criativo** é uma plataforma de workflows de marketing orientada por IA. Ela centraliza metodologia, regras de negócio, estado de produtos, aprovações e limites de segurança para que diferentes runtimes de IA possam operar a mesma base sem depender uns dos outros.

Hoje o projeto suporta três runtimes principais:

- **Claude** — runtime funcional de referência;
- **Hermes** — runtime com paridade contratual sobre os workflows suportados;
- **Codex** — runtime com paridade contratual sobre os mesmos workflows.

A arquitetura foi desenhada para que nenhum runtime seja a fonte de verdade dos outros.

```text
AGENTS.md / CLAUDE.md / HERMES.md
              │
              ▼
           agents/
   metodologia + políticas
              │
              ▼
            core/
 contratos + regras de negócio
      ┌────────┼────────┐
      ▼        ▼        ▼
   Claude    Hermes    Codex
```

---

## O que este repositório faz

O repositório funciona como o **motor operacional do Fluxo Criativo**. Ele organiza e padroniza tarefas de marketing como:

- criação e seleção de produtos;
- pesquisa de mercado;
- copy para página, anúncio, social e roteiro;
- funis Low Ticket e Middle Ticket;
- páginas de vendas;
- carrosséis e criativos;
- geração de imagem e vídeo por boundaries externos;
- leitura e planejamento de Meta Ads;
- criação de campanha em dry-run;
- otimização e escala com gates de aprovação;
- relatórios de Ads;
- dashboards sociais;
- planejamento e execução persistente via Plan e Toolkit;
- avaliação de publicação social;
- diagnóstico de dependências High Ticket / C10X.

O sistema não assume que um modelo de IA específico será usado. A intenção do usuário é resolvida por um workflow canônico, a metodologia vem de `agents/`, a regra de negócio vem de `core/` e o runtime apenas conecta essas peças.

---

## Como um humano deve entender o projeto

Pense no repositório em quatro camadas:

### 1. `agents/` — como pensar

Contém a **metodologia neutra de runtime**.

Exemplos:

- Light Copy;
- VTSD;
- pesquisa de mercado;
- análise de tráfego;
- criação, otimização e escala de campanhas;
- páginas;
- carrosséis;
- dashboards;
- políticas de segurança, approval e secrets.

`agents/` ensina critérios, fórmulas, checklists, decisões, estruturas e frameworks. Ele **não** executa provider, shell, cron, publicação, deploy ou leitura de segredo.

### 2. `core/` — como o sistema se comporta

Contém os **contratos executáveis e regras de negócio**:

- registry de workflows;
- estado dos produtos;
- ApprovalPolicy;
- SecretProvider;
- workflows locais;
- boundaries externos;
- Meta Ads;
- Ads Report;
- Plan;
- Toolkit;
- publisher;
- diagnóstico High Ticket.

É a camada que define o que é permitido, bloqueado, financeiro, externo ou dependente de aprovação.

### 3. `adapters/` — como cada runtime usa o sistema

Cada runtime possui seu próprio adapter:

```text
adapters/claude/
adapters/hermes/
adapters/codex/
```

Eles convergem para o mesmo `core/` e a mesma metodologia em `agents/`.

Um adapter de um runtime **não deve importar outro runtime**.

### 4. Entrypoints — onde cada IA começa

- `CLAUDE.md` → entrada do Claude;
- `HERMES.md` → entrada do Hermes;
- `AGENTS.md` → entrada do Codex.

Esses arquivos explicam ao runtime onde encontrar metodologia, contratos e regras. Eles não substituem `agents/` nem `core/`.

---

## Como um agente de IA deve operar o repositório

Um agente novo deve seguir esta ordem:

1. ler seu entrypoint (`AGENTS.md`, `CLAUDE.md` ou `HERMES.md`);
2. resolver a intenção pelo registry em `core/workflows/registry.js`;
3. consultar a metodologia relevante em `agents/`;
4. consultar a policy aplicável em `agents/policies/` e `core/`;
5. usar o adapter do próprio runtime;
6. nunca importar ou executar adapter de outro runtime;
7. preservar o estado em `meus-produtos/{slug}/`;
8. tratar providers, publicação, cron, deploy e operações financeiras como boundaries externos sujeitos a gates.

Regra estrutural:

```text
Claude ─┐
Hermes ─┼──→ agents/ + core/
Codex ──┘
```

Nunca:

```text
Claude → Hermes
Claude → Codex
Hermes → Claude
Hermes → Codex
Codex → Claude
Codex → Hermes
```

---

## Registry e os 26 workflows canônicos

O registry central possui **26 workflows**.

### Produto

- `product.create`
- `product.select`

### Pesquisa e copy

- `research.market`
- `copy.page`
- `copy.ad`
- `copy.social`
- `copy.script`

### Funis e páginas

- `funnel.low_ticket`
- `funnel.middle_ticket`
- `page.sales`

### Conteúdo e criativos

- `carousel.generate`
- `carousel.schedule`
- `image.generate`
- `creative.static`
- `video.generate`

### Tráfego e Meta Ads

- `ads.insights`
- `traffic.insights` — alias legado de `ads.insights`
- `ads.campaign.create`
- `ads.optimize`
- `ads.scale`
- `ads.report`

### Social

- `social.dashboard`
- `social.publish`

### Orquestração

- `plan.execute`
- `toolkit.execute`

### Comercial

- `commercial.playbook`

---

## Status de suporte por runtime

Claude continua sendo a referência funcional histórica.

Hermes e Codex usam quatro estados equivalentes:

- `*_READY` — workflow local ou de orquestração com paridade testada;
- `*_EXTERNAL_DRY_RUN` — contrato, metodologia e boundary de segurança prontos, mas sem provider live validado;
- `*_BLOCKED_EXTERNAL` — dependência externa indisponível; comportamento fail-closed;
- `*_LEGACY` — alias ou compatibilidade histórica, não uma implementação separada.

Distribuição atual de Hermes:

- 12 `HERMES_READY`;
- 12 `HERMES_EXTERNAL_DRY_RUN`;
- 1 `HERMES_BLOCKED_EXTERNAL` (`social.publish`);
- 1 `HERMES_LEGACY` (`traffic.insights`).

Distribuição atual de Codex:

- 12 `CODEX_READY`;
- 12 `CODEX_EXTERNAL_DRY_RUN`;
- 1 `CODEX_BLOCKED_EXTERNAL` (`social.publish`);
- 1 `CODEX_LEGACY` (`traffic.insights`).

Importante: **dry-run não significa provider live validado**.

---

## Estado dos produtos

A fonte de verdade operacional de cada produto continua em:

```text
meus-produtos/{slug}/
```

O produto ativo é indicado por:

```text
meus-produtos/.ativo
```

Exemplo de estrutura:

```text
meus-produtos/
├── .ativo
└── meu-produto/
    ├── perfil.md
    ├── idconsumidor.md
    ├── pesquisa-mercado.md
    ├── tipo.md
    ├── projeto/
    └── entregas/
```

Os runtimes podem registrar memória ou contexto auxiliar, mas essa memória **não substitui os arquivos do produto**.

---

## Metodologia compartilhada

A metodologia canônica vive em `agents/`.

Estrutura principal:

```text
agents/
├── README.md
├── METHODOLOGY-MANIFEST.js
├── policies/
├── methodology/
└── skills/
```

`METHODOLOGY-MANIFEST.js` registra domínios migrados, caminhos canônicos e conceitos obrigatórios. Os testes de arquitetura falham se uma metodologia canônica perder conceitos críticos ou voltar a depender operacionalmente de `.claude/`.

`.claude/skills/` continua existindo como compatibilidade e UX do Claude. Material legado que mistura metodologia com runtime foi isolado em `legacy-runtime/` e não é fonte canônica.

---

## Segurança, segredos e ApprovalPolicy

A arquitetura foi construída para evitar que modelos recebam segredos em plaintext.

### SecretProvider

1Password é a fonte primária de segredos.

Os workflows trabalham com **nomes lógicos**, por exemplo:

```text
META_ACCESS_TOKEN
APIFY_API_TOKEN
OPENROUTER_API_KEY
FREEPIK_API_KEY
HEYGEN_API_KEY
REPLICATE_API_TOKEN
```

O modelo não deve receber o valor real do segredo em prompt, log, arquivo, argumento ou resultado serializado.

### ApprovalPolicy

Ações sensíveis usam `ApprovalPolicy`.

Modos principais:

- `disabled` — bloqueia;
- `manual` — exige grant explícito;
- `standing` — autorização limitada por escopo, validade e limites.

A policy pode considerar:

- workflow;
- produto;
- rede/plataforma;
- tipo de ação;
- `action_id`;
- expiração;
- limites;
- revogação.

Ações financeiras e irreversíveis permanecem fail-closed por padrão.

---

## Meta Ads

O boundary compartilhado da Meta vive em:

```text
core/external/meta-ads.js
```

Ele diferencia três classes de operação:

```text
READ
WRITE
FINANCIAL_WRITE
```

### Operações de leitura

Entre as operações allowlisted estão:

- `meta.auth.validate`
- `meta.accounts.list`
- `ads.account.read`
- `ads.campaigns.list`
- `ads.pixels.list`
- `ads.conversions.list`
- `ads.audiences.list`
- `ads.interests.search`
- `ads.creatives.validate`
- `ads.insights`

### Autenticação

Dois modos são modelados:

#### APP

Usa o segredo lógico:

```text
META_ACCESS_TOKEN
```

O valor real deve ser fornecido somente pelo `SecretProvider`.

#### MCP_CONECTOR

Usa OAuth gerenciado externamente.

MCP remove a necessidade do token dentro do runtime, mas **não remove approvals**.

### Escritas

A criação e alteração de campanhas são tratadas como `WRITE`.

Exemplos:

- `ads.campaign.create`
- ações de otimização/status dentro do boundary Meta.

Escritas exigem approval apropriado.

### Escala financeira

`ads.scale` é `FINANCIAL_WRITE`.

Regras:

- exige approval;
- exige grant manual exato para o `action_id`;
- standing approval não autoriza escala financeira;
- MCP não contorna esse gate.

### Campanhas novas

Toda campanha criada pelo sistema nasce:

```text
status: PAUSED
execution: dry_run
```

O sistema nunca deve assumir publicação ou ativação imediata.

### Estado atual da Meta

A arquitetura Meta está pronta em contrato, metodologia, approvals e dry-run.

**Não há validação live da Graph API ou MCP nesta base.**

---

## Ads Report

Relatórios usam:

```text
core/external/ads-report.js
```

O `ReportResult` é separado da entrega.

Antes de qualquer delivery:

```text
delivery: null
```

A entrega é modelada por descriptor separado e permanece dry-run enquanto não houver provider live ativado.

---

## Plan Executor

`plan.execute` trabalha com tarefas tipadas por `workflow_id`.

O Plan:

- rejeita shell/comando arbitrário;
- resolve risco pelo registry;
- propaga risco de workflows filhos;
- aplica ApprovalPolicy;
- bloqueia workflows desconhecidos;
- aplica dependências;
- propaga dependências bloqueadas;
- não dispara automaticamente providers externos.

Ele existe para resolver **o que pode ou não pode ser executado**, não para transformar qualquer texto em shell.

---

## Toolkit persistente

`toolkit.execute` oferece uma camada persistente de execução de plano por produto.

O estado fica em:

```text
meus-produtos/{slug}/projeto/{toolkit_id}/
```

O Toolkit suporta:

- tarefas tipadas;
- idempotência;
- dependências;
- pause/resume;
- `running`;
- `completed`;
- `failed`;
- retry explícito;
- reavaliação de tarefas bloqueadas;
- proteção contra reexecução de tarefas concluídas.

Claude, Hermes e Codex usam os mesmos contratos de Toolkit.

---

## Social publisher

`social.publish` possui contrato de request e approval, mas permanece **fail-closed**.

Plataformas modeladas:

- Instagram;
- Facebook;
- LinkedIn;
- TikTok;
- YouTube.

Mesmo com approval válido e `autopublish: true`, sem adapter oficial o resultado continua equivalente a:

```text
status: blocked
published: false
external_id: null
published_at: null
dry_run: true
```

Approval válido não significa provider disponível.

---

## High Ticket / C10X

O core possui diagnóstico explícito das dependências High Ticket.

Quando as capacidades `ht-*` exigidas não estão disponíveis, o sistema retorna bloqueio estruturado em vez de inventar execução.

A presença futura dessas dependências pode liberar a detecção, mas não ativa automaticamente provider ou execução Hermes/Codex.

---

## Providers externos

A base contém contracts e dry-runs para integrações como:

- Meta;
- MCP;
- Apify;
- OpenRouter;
- Freepik;
- HeyGen;
- Replicate;
- UAZAPI;
- publishers sociais;
- cron;
- delegates;
- gateway;
- deploy.

No estado atual, esses providers **não devem ser interpretados como live-validados**.

A ativação de cada provider deve acontecer separadamente, preservando:

- SecretProvider;
- ApprovalPolicy;
- allowlists;
- dry-run como fallback;
- fail-closed para ações indisponíveis ou sensíveis.

---

## Estrutura principal do repositório

```text
fluxo_criativo/
├── README.md
├── AGENTS.md
├── CLAUDE.md
├── HERMES.md
├── ARQUITETURA.md
│
├── agents/
│   ├── README.md
│   ├── METHODOLOGY-MANIFEST.js
│   ├── policies/
│   ├── methodology/
│   └── skills/
│
├── core/
│   ├── workflows/
│   ├── local/
│   ├── external/
│   ├── orchestration/
│   ├── approvals/
│   ├── secrets/
│   └── state/
│
├── adapters/
│   ├── claude/
│   ├── hermes/
│   ├── codex/
│   ├── integrations/
│   └── secrets/
│
├── .claude/
│   ├── commands/
│   ├── agents/
│   ├── skills/
│   ├── rules/
│   ├── hooks/
│   └── settings.json
│
├── docs/
│   ├── core/
│   ├── hermes/
│   ├── codex/
│   ├── architecture/
│   └── refactor/
│
├── tests/
│   ├── architecture/
│   ├── claude/
│   ├── hermes/
│   ├── codex/
│   ├── core/
│   └── security/
│
├── meus-produtos/
├── scripts/
├── painel/
└── legacy/
```

---

## Qual arquivo ler primeiro

### Se você é humano

Leia nesta ordem:

1. `README.md` — visão geral;
2. `ARQUITETURA.md` — arquitetura técnica;
3. `agents/README.md` — metodologia compartilhada;
4. `docs/core/README.md` — contratos centrais;
5. `docs/hermes/` ou `docs/codex/` — detalhes de runtime.

### Se você é Codex

Leia:

```text
AGENTS.md
agents/README.md
agents/policies/
core/workflows/registry.js
docs/core/README.md
```

### Se você é Claude

Comece por:

```text
CLAUDE.md
agents/
core/
.claude/commands/
```

`.claude/` é UX e compatibilidade Claude. A metodologia compartilhada continua em `agents/`.

### Se você é Hermes

Comece por:

```text
HERMES.md
agents/
core/
adapters/hermes/
```

---

## Testes

O projeto possui regressão separada para arquitetura, runtimes, core e segurança.

### Arquitetura

```bash
for test in tests/architecture/*.test.js; do node "$test" || exit 1; done
```

### Claude

```bash
for test in tests/claude/*.test.js; do node "$test" || exit 1; done
```

### Hermes

```bash
for test in tests/hermes/*.test.js; do node "$test" || exit 1; done
```

### Codex

```bash
for test in tests/codex/*.test.js; do node "$test" || exit 1; done
```

### Core

```bash
for test in tests/core/*.test.js; do node "$test" || exit 1; done
```

### Segurança

```bash
for test in tests/security/*.test.js; do node "$test" || exit 1; done
```

A regressão Claude/Hermes/Codex cobre os 26 workflows com fixtures isoladas e guards que impedem rede, subprocessos e writes fora das fixtures durante os testes de paridade.

---

## O que está pronto hoje

- arquitetura multi-runtime;
- metodologia compartilhada em `agents/`;
- contratos compartilhados em `core/`;
- Claude preservado;
- Hermes com paridade contratual;
- Codex com paridade contratual;
- registry de 26 workflows;
- estado persistente por produto;
- ApprovalPolicy;
- SecretProvider;
- Meta Ads em contrato/dry-run;
- Ads Report;
- Plan;
- Toolkit;
- publisher fail-closed;
- High Ticket dependency detection;
- testes de arquitetura, segurança e paridade.

---

## O que ainda não está live

A refatoração não ativou automaticamente providers externos.

Ainda precisam de ativação e validação específicas:

- Meta Graph API real;
- MCP Meta real;
- Apify real;
- OpenRouter real;
- Freepik real;
- HeyGen real;
- Replicate real;
- UAZAPI real;
- publishers sociais;
- cron real;
- delegates externos;
- gateway real;
- deploy automático.

Esses itens são **evoluções de integração**, não pendências da arquitetura multi-runtime.

---

## Princípio central

O Fluxo Criativo não deve depender de um modelo específico para existir.

A regra é:

> **metodologia em `agents/`, contratos em `core/`, integração nos adapters e estado em `meus-produtos/`.**

Se um novo runtime for adicionado no futuro, ele deve consumir essa mesma base em vez de copiar Claude, Hermes ou Codex.
