# Changelog da Sanitização e evolução do core

Este registro descreve mudanças da Fase H. Cada lote é isolado em seu próprio commit e validado sem rede, credenciais, APIs, instaladores ou deploy.

## Lote 1: instalação automática em SessionStart

- Commit: `security: remove automatic runtime installation hook`
- Arquivos: `.claude/hooks/setup-node.sh` (removido), `.claude/settings.json`, este changelog.
- Antes: SessionStart podia instalar Node, Homebrew, nvm, pacotes apt ou winget, incluindo `curl | bash` e `sudo`.
- Depois: nenhum SessionStart instala software. Os requisitos permanecem passivos: cada runtime/ferramenta opcional deve ser instalado e configurado pelo operador antes de usar o recurso que o exige.
- Risco mitigado: instalação automática, elevação de privilégio e execução remota no início da sessão.
- Possível regressão: ambientes sem Node não executam hooks legados que dependem dele; nenhum fluxo de negócio depende do hook removido.
- Validação: busca estática de referências a `setup-node.sh`, revisão da configuração SessionStart e `git diff --check`.

## Lote 2: permissões do runtime Claude

- Commit: `security: tighten Claude runtime permissions`
- Arquivos: `.claude/settings.json`, este changelog.
- Antes: a allow-list autoaprovava `Bash(ls *)`, `Bash(vercel *)` e `Bash(python3)`, incluindo deploy e execução arbitrária por interpretador.
- Depois: mantém leitura delimitada do projeto, `WebSearch(*)` e `WebFetch(*)` para pesquisa funcional. Remove toda autoaprovação de Bash, deploy e comandos externos; esses side effects exigem autorização explícita do runtime e os gates do fluxo.
- Risco mitigado: execução automática de comandos, deploy não confirmado e uso de interpretador fora do escopo.
- Possível regressão: scripts locais que antes não pediam autorização agora exigem confirmação explícita, sem remoção do script ou da capacidade funcional.
- Validação: revisão estática da allow-list, confirmação da manutenção de `WebSearch`/`WebFetch` e `git diff --check`.

## Lote 3: isolamento de hooks

- Commit: `security: isolate hooks from external side effects`
- Arquivos: `.claude/settings.json`, `docs/refactor/HOOK-AUDIT.md`, este changelog.
- Antes: hooks GSD, incluindo atualização por `npm view`, eram configurados como parte do runtime ativo.
- Depois: GSD fica preservado, mas desativado como compatibilidade opcional. Permanecem ativos apenas guards/validações locais e o status writer pendente de reescrita local-only.
- Risco mitigado: consulta externa e dependência de GSD durante sessões de negócio.
- Possível regressão: recursos de status/guardas GSD não são carregados automaticamente; nenhuma metodologia ou workflow de negócio depende deles.
- Validação: matriz de cada hook, busca por referências GSD ativas em `settings.json` e revisão dos matchers restantes.

## Lote 4: status do agente somente local

- Commit: `security: make agent status reporting local only`
- Arquivos: `.claude/hooks/agent-status-writer.js`, `tests/security/agent-status-writer-local-only.test.js`, este changelog.
- Antes: o hook lia `.env` e variáveis `WORKSHOP_*`, podendo enviar status para endpoint remoto por HTTP/HTTPS.
- Depois: o hook só lê a entrada do evento e estado local mínimo do produto, atualizando `agents-status.json` e `agents-status.js` para o painel local. Não registra entrada bruta de ferramentas, segredos ou URLs.
- Risco mitigado: telemetria remota e exposição indireta de segredo em hook.
- Possível regressão: endpoint remoto de status deixa de receber eventos por decisão de segurança; o painel local preserva os dois arquivos de contrato.
- Validação: teste estático local-only, busca de padrões proibidos e verificação sintática do JavaScript sem rede.

## Lote 5: segredos fora dos fluxos conversacionais

- Commit: `security: remove secrets from conversational setup flows`
- Arquivos: política em `CLAUDE.md` e `AGENTS.md`, commands de configuração, `.gitignore`, `docs/security/SECRETS.md` e este changelog.
- Antes: vários commands pediam credenciais no chat, testavam por curl e escreviam `.env` durante a conversa.
- Depois: a política global proíbe coleta, argumento CLI, URL/header e log de segredo; os commands cobertos exigem provisionamento externo. As integrações permanecem disponíveis para adapters futuros.
- Risco mitigado: vazamento de credencial em chat, terminal, histórico ou telemetria.
- Possível regressão: configuração guiada de integrações deixa de testar/concluir automaticamente até existir secure setup/adapters.
- Validação: inventário estático, busca de instruções diretas de coleta nos commands cobertos e ausência de segredo real em alterações.

## Lote 6: isolamento de instaladores legados

- Commit: `refactor: isolate legacy installers`
- Arquivos: instaladores movidos para `legacy/installers/`, `legacy/installers/README.md`, `README.md` e este changelog.
- Antes: instaladores ativos sob `instalador/` eram apresentados como setup atual e executavam instalação automática.
- Depois: permanecem somente como histórico, explicitamente fora do core e não utilizáveis para setup atual.
- Risco mitigado: execução acidental de instalador com rede, privilégio e dependências desatualizadas.
- Possível regressão: usuários que dependiam do caminho antigo precisam de um setup manual/documentado; nenhum workflow de negócio referencia os arquivos.
- Validação: busca de todas as referências, atualização do README e confirmação de que `instalador/` não permanece como destino ativo.

## Lote 7: desacoplamento da distribuição desktop opcional

- Commit: `refactor: decouple optional desktop distribution`
- Arquivos: `package.json`, `README.md`, `docs/refactor/DESKTOP-DISTRIBUTION.md` e este changelog.
- Antes: a documentação apresentava Electron e instaladores como parte funcional do produto, embora o diretório `electron/` esteja ausente neste commit.
- Depois: a distribuição desktop é explicitamente opcional/legada; scripts e manifesto são preservados sem execução ou remoção cega.
- Risco mitigado: expectativa de setup obrigatório ou app desktop funcional sem fonte correspondente.
- Possível regressão: nenhuma no core; consumidores de builds Electron precisam de uma recuperação dedicada.
- Validação: busca estática de referências Electron/desktop, conferência da ausência de `electron/` e `git diff --check`.

## Política posterior: 1Password como secret provider

- Commit: `security: adopt 1Password as primary secret provider`
- Arquivos: política global, seis commands de configuração, `.env.op.example`, documentação 1Password, testes estáticos e este changelog.
- Antes: provisionamento externo genérico e `.env` ainda apareciam como padrão documental.
- Depois: 1Password é a fonte de verdade; `.env.op` guarda apenas referências `op://` e `op run` injeta variáveis em runtime. `.env` é `LEGACY_SECRET_FLOW`.
- Validação: testes estáticos sem acesso a vault, credenciais ou binário `op`.

## Ajuste: catálogo 1Password completo

- Commit: `security: complete 1Password secret catalog`
- Arquivos: `.env.example`, `.env.op.example`, catálogo 1Password, teste estático e este changelog.
- Depois: todos os segredos do catálogo legado têm referência 1Password; IDs são classificados como configuração não secreta; aliases Meta são temporários e não duplicam itens no vault.

## Ajuste: confinamento do status writer

- Commit: `security: confine status hook writes to project root`
- Arquivos: status writer, teste local-only/confinamento e este changelog.
- Depois: o hook resolve a raiz pelo próprio caminho e ignora `data.cwd` como autoridade de filesystem. A fixture de teste comprova que um cwd externo não recebe escrita.

## Fase I, lote 1: contrato neutro de workflow

- Commit: `core: introduce runtime-neutral workflow contracts`
- Arquivos: documentação em `docs/core/`, contrato em `core/contracts/`, definições descritivas iniciais em `core/workflows/` e este changelog.
- Antes: a intenção de workflow só era endereçável por superfícies específicas do Claude.
- Depois: sete workflows têm IDs lógicos e metadados serializáveis, sem executar ou mover a origem legada.
- Risco mitigado: acoplamento prematuro de futuros runtimes a comandos, skills e agents do Claude.
- Possível regressão: nenhuma execução foi redirecionada; o core ainda é somente descritivo.
- Validação: revisão estática das fontes de compatibilidade e `git diff --check`.

## Fase I, lote 2: contrato de approval policy

- Commit: `core: add approval policy contract`
- Arquivos: `core/approvals/` e este changelog.
- Antes: a política `manual`/`standing`/`disabled` existia apenas na documentação de refatoração.
- Depois: há um objeto serializável com escopo, validade, limites, autorizador e revogação, sem banco ou side effect.
- Risco mitigado: interpretar `disabled` como permissão implícita ou aceitar standing approval fora de validade.
- Possível regressão: nenhuma execução é conectada ao contrato nesta fase.
- Validação: revisão estática e cobertura unitária local no lote de testes de contrato.
