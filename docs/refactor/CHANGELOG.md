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

## Fase I, lote 3: contrato de secret provider

- Commit: `core: add secret provider contract`
- Arquivos: `core/secrets/`, reserva documental em `adapters/secrets/1password/` e este changelog.
- Antes: a política 1Password não possuía um contrato executável neutro de runtime.
- Depois: um mock só conhece nomes lógicos, disponibilidade e referências `op://`; a operação exige allowlist e não executa processo nesta fase.
- Risco mitigado: introdução acidental de API que retorne plaintext ao modelo.
- Possível regressão: nenhuma integração é alterada ou executada.
- Validação: testes locais de contrato no lote de testes, sem binário `op`, vault ou credencial.

## Fase I, lote 4: contrato de scheduler

- Commit: `core: add scheduler contract`
- Arquivos: `core/scheduling/`, `docs/core/SCHEDULER-CONTRACT.md` e este changelog.
- Antes: scheduling era descrito somente pelas superfícies específicas de runtime.
- Depois: job serializável valida ID, workflow, timezone, schedule, idempotência, approval e destino; a implementação em memória não agenda nem executa nada.
- Risco mitigado: acoplamento do core a `/schedule` e confusão de identificação entre rotinas.
- Possível regressão: nenhuma rotina legada é modificada ou acionada.
- Validação: testes locais de formato, timezone e registros em memória no lote de testes.

## Fase I, lote 5: contratos de integração externa

- Commit: `core: define external integration contracts`
- Arquivos: `core/integrations/`, `docs/core/INTEGRATION-CONTRACTS.md` e este changelog.
- Antes: a intenção de integração era inseparável de provider e runtime legados.
- Depois: capacidades como geração de imagem, insights e pesquisa são neutras; envio e publicação declaram side effect.
- Risco mitigado: vazamento de nomes de provider ou APIs concretas para o core.
- Possível regressão: nenhuma API, notificação ou publicação é acionada.
- Validação: teste local do contrato e revisão de que não há clientes externos.

## Fase I, lote 6: limite de estado de produto

- Commit: `core: introduce product state boundary`
- Arquivos: `core/state/` e este changelog.
- Antes: cada superfície resolvia diretamente caminhos de produto.
- Depois: funções pequenas validam slug, produto ativo e tipos de artefato conhecidos, sem modificar `meus-produtos/`.
- Risco mitigado: path traversal e divergência de caminhos de contexto/entrega entre runtimes.
- Possível regressão: nenhum arquivo existente é migrado, escrito ou renomeado.
- Validação: fixture local de estado, traversal rejeitado e smoke check da estrutura legada.

## Fase I, lote 7: registry inicial de workflows

- Commit: `core: add initial workflow registry`
- Arquivos: `core/workflows/`, `docs/core/WORKFLOW-REGISTRY.md` e este changelog.
- Antes: não havia registro único de IDs neutros e suas origens de compatibilidade.
- Depois: sete IDs são validados, únicos e resolvidos de forma explícita para suas fontes atuais, sem execução automática.
- Risco mitigado: fallback implícito para command/skill arbitrário e acoplamento de adapter a nomes não documentados.
- Possível regressão: as fontes originais permanecem nos mesmos caminhos e nenhum dispatcher novo as chama.
- Validação: registry carregado em teste local, IDs duplicados e desconhecidos rejeitados.

## Fase I, lote 8: skeletons de adapters de runtime

- Commit: `core: add runtime adapter skeletons`
- Arquivos: `adapters/claude/`, `adapters/hermes/`, `adapters/codex/` e este changelog.
- Antes: não havia uma superfície comum para cada runtime consultar o registry.
- Depois: cada runtime resolve ID conhecido para um destino descritivo e não executável; apenas Claude expõe a origem atual como referência.
- Risco mitigado: execução acidental de workflows durante a etapa de compatibilidade.
- Possível regressão: nenhuma; Hermes e Codex seguem sem adapter operacional nesta fase.
- Validação: testes locais de resolução e falha explícita para workflow desconhecido.

## Fase I, lote 9: testes de contrato do core

- Commit: `test: cover runtime-neutral core contracts`
- Arquivos: `tests/core/runtime-neutral-contracts.test.js` e este changelog.
- Antes: os contratos iniciais não tinham uma bateria local integrada.
- Depois: o teste verifica registry, approvals, secret provider sem plaintext, scheduler, estado sem traversal, adapters e presença dos ativos legados.
- Risco mitigado: regressão silenciosa de contrato, ID duplicado, timezone inválida, aprovação expirada ou caminho escapando do produto.
- Possível regressão: nenhuma chamada externa é simulada; integrações reais continuam cobertas apenas por fases futuras.
- Validação: `node tests/core/runtime-neutral-contracts.test.js`, além dos testes de segurança existentes, sem rede ou credenciais.

## Fase I, ajuste 1: escopo e grants de approval policy

- Commit: `core: enforce approval scope and action grants`
- Arquivos: `core/approvals/`, testes de contrato e este changelog.
- Antes: approval era avaliada sem contexto de operação e `manual` podia ser interpretado como autorização persistente.
- Depois: evaluator valida workflow, escopo, expiração, revogação e limites; `manual_grant` fica preso a um único `action_id`.
- Risco mitigado: autorização fora de escopo, standing além do limite e reuso acidental de aprovação manual.
- Possível regressão: chamadores futuros devem fornecer contexto e uso suficientes; dados insuficientes para limite bloqueiam por segurança.
- Validação: testes unitários locais para divergências de escopo, grants, expiração, revogação e limites.

## Fase I, ajuste 2: scheduler com approval e idempotência válidas

- Commit: `core: validate scheduled approvals and idempotency`
- Arquivos: `core/scheduling/`, contrato de scheduler, testes e este changelog.
- Antes: qualquer objeto podia preencher `approval_policy` e a chave de idempotência não tinha efeito.
- Depois: job exige `ApprovalPolicy` válida para o mesmo workflow; scheduler em memória rejeita `job_id` e `idempotency_key` duplicados.
- Risco mitigado: jobs com policy incompleta/desalinhada e registro silencioso de intenção duplicada.
- Possível regressão: chamadores futuros precisam informar policy completa e chave única.
- Validação: testes locais de policy inválida, workflow divergente e duplicidade de chave.

## Fase I, ajuste 3: efeitos externos e risco composto corretos

- Commit: `core: align workflow effects with external capabilities`
- Arquivos: contratos, definições/registry, skeletons de adapter, documentação, testes e este changelog.
- Antes: workflows com pesquisa, geração ou leitura externa podiam parecer locais; `toolkit.execute` parecia filesystem-only.
- Depois: capabilities externas exigem `side_effects.external`; `toolkit.execute` é composto, conservador e exige resolução de risco dos filhos.
- Risco mitigado: gates futuros subestimarem leitura/generação externa ou delegação de toolkit.
- Possível regressão: qualquer nova definição com capability de integração e `external: false` falha na validação.
- Validação: teste local relacionando capabilities de integração à metadata de efeito externo.

## Fase I, ajuste 4: imutabilidade profunda de contratos

- Commit: `core: make contract values deeply immutable`
- Arquivos: helper de contratos, workflow, approvals, scheduling, decisão técnica, testes e este changelog.
- Antes: apenas o objeto externo era congelado; arrays e objetos internos podiam ser alterados por referência.
- Depois: cópia estruturada seguida de freeze profundo protege valores serializáveis retornados pelo core.
- Risco mitigado: consumidor alterar metadata, inputs, limites ou job depois da validação do contrato.
- Possível regressão: consumidores futuros devem criar novo contrato em vez de mutar um existente.
- Validação: testes locais tentam mutar campos aninhados e confirmam que o registry retorna valor intacto.

## Fase J, lote 1: contexto operacional Hermes

- Commit: `hermes: add project runtime context`
- Arquivos: `HERMES.md`, `docs/hermes/README.md` e este changelog.
- Antes: Hermes tinha apenas um skeleton técnico, sem contexto operacional próprio.
- Depois: o runtime possui contexto curto sobre estado, core, segurança, approvals e delegação, sem herdar `CLAUDE.md` como autoridade.
- Risco mitigado: runtime assumir commands Claude como nativos ou tratar segredo/aprovação de forma incompatível.
- Possível regressão: nenhuma execução é habilitada.
- Validação: revisão estática do contexto e testes do adapter no lote final.

## Fase J, lote 2: classificação de skills Hermes

- Commit: `hermes: classify compatible marketing skills`
- Arquivos: matriz declarativa em `adapters/hermes/`, documentação Hermes e este changelog.
- Antes: não havia allowlist para distinguir conhecimento portável de superfícies Claude.
- Depois: seis conhecimentos candidatos têm classificação explícita; somente metodologia local pode ser nativa, e dependências externas/runtime passam por wrapper.
- Risco mitigado: carregamento indiscriminado de `.claude/skills/` e execução de dependências Claude por Hermes.
- Possível regressão: skills fora da allowlist não são resolvidas pelo adapter nesta fase.
- Validação: teste local verifica classificação antes de resolver wrapper.

## Fase J, lote 3: wrappers iniciais de workflow

- Commit: `hermes: add initial workflow skill wrappers`
- Arquivos: seis wrappers Hermes, documentação de preparação/arquitetura e este changelog.
- Antes: os workflows do core não tinham superfície Hermes identificável.
- Depois: cada workflow alvo possui wrapper curto que aponta para registry, estado, conhecimento e fonte Claude; capabilities externas retornam dry-run.
- Risco mitigado: duplicação de skill, chamada de provider por prompt e execução direta de command Claude.
- Possível regressão: wrappers não produzem artefato operacional nem executam integração nesta fase.
- Validação: testes locais conferem caminhos, workflow IDs e ausência de chamadas externas.

## Fase J, lote 4: resolver Hermes para wrappers suportados

- Commit: `hermes: resolve supported workflows to wrappers`
- Arquivos: resolver Hermes, documentação do adapter e este changelog.
- Antes: todo workflow Hermes retornava `not_implemented`.
- Depois: os seis IDs suportados resolvem caminho de wrapper explícito e não executável; qualquer outro ID falha sem fallback.
- Risco mitigado: runtime tentar executar command/skill Claude sem wrapper ou liberar toolkit composto por engano.
- Possível regressão: workflows Hermes fora da primeira allowlist permanecem indisponíveis por design.
- Validação: teste local de resolução, ID desconhecido e toolkit sem wrapper.

## Fase J, lote 5: mapa de agentes Hermes

- Commit: `hermes: map interactive agents and delegates`
- Arquivos: mapa declarativo de agentes, documentação Hermes e este changelog.
- Antes: o plano de agentes não era consumível pelo adapter.
- Depois: agentes interativos, candidatos a delegate e clonador adiado estão explicitamente classificados e desabilitados.
- Risco mitigado: converter entrevista/orquestração em subagente ou liberar clonador sem gate.
- Possível regressão: nenhum agente é invocado pelo adapter nesta fase.
- Validação: teste local confere mapeamento e que nenhum delegate esteja habilitado.

## Fase J, lote 6: contrato seguro de delegação

- Commit: `hermes: add safe delegation contract`
- Arquivos: contrato/mock Hermes, arquitetura Hermes e este changelog.
- Antes: candidatos a delegate não tinham envelope de contexto ou restrição executável.
- Depois: request valida agente, workflow, produto, paths e capabilities; o resolver retorna apenas descriptor dry-run.
- Risco mitigado: delegate receber segredo, ampliar capability, encadear delegates ou executar side effect externo.
- Possível regressão: delegação real permanece indisponível por design.
- Validação: testes locais de bloqueio de segredo/capability externa e ausência de dispatch.

## Fase J, lote 7: tradução de cron Hermes

- Commit: `hermes: add cron job translation adapter`
- Arquivos: adapter de scheduling Hermes, documentação e este changelog.
- Antes: o core tinha job neutro, mas não descriptor Hermes para inspecionar a tradução.
- Depois: job válido vira descriptor `hermes.cron` dry-run, preservando timezone, chave de idempotência, workdir, policy, destino e wrapper necessário.
- Risco mitigado: cron real ou permissão externa implícita por tradução de scheduler.
- Possível regressão: jobs sem wrapper Hermes continuam indisponíveis; manual/disabled não são automatizados.
- Validação: testes locais de timezone, idempotência, policy disabled/manual e ausência de cron real.

## Fase J, lote 8: descriptors de gateway Hermes

- Commit: `hermes: add gateway notification descriptors`
- Arquivos: gateway Hermes, arquitetura Hermes e este changelog.
- Antes: notificações de aprovação/resultado não tinham formato neutro para gateway.
- Depois: quatro eventos e destinos futuros têm descriptors dry-run que não enviam e recusam campos sensíveis.
- Risco mitigado: integração custom prematura, envio acidental e vazamento de segredo em payload.
- Possível regressão: nenhum canal recebe notificação até adapter/gateway real posterior.
- Validação: teste local garante `sent: false` e rejeição de payload com token/secret.

## Fase J, lote 9: fronteira 1Password para runtime Hermes

- Commit: `hermes: define 1Password runtime boundary`
- Arquivos: allowlist documental de operações, adapter 1Password, documentação Hermes e este changelog.
- Antes: o contrato 1Password não tinha uma enumeração local de operações futuras Hermes.
- Depois: seis operações são allowlisted apenas como descriptors bloqueados/dry-run; não existe leitura de vault, plaintext ou shell genérico.
- Risco mitigado: adapter Hermes introduzir `get_secret`, `op read` exposto ao modelo ou execução arbitrária.
- Possível regressão: integrações externas permanecem intencionalmente indisponíveis.
- Validação: teste local confirma allowlist, bloqueio e ausência de API plaintext.

## Fase J, lote 10: testes do adapter Hermes

- Commit: `test: cover Hermes runtime adapter contracts`
- Arquivos: testes Hermes, pequena função de classificação e este changelog.
- Antes: wrappers, delegates, cron, gateway e boundary 1Password não tinham regressão integrada.
- Depois: teste local cobre resolução, bloqueios, políticas, imutabilidade de descriptor e ausência de chamadas externas.
- Risco mitigado: wrapper executável acidentalmente, cron manual/disabled automatizado, delegate com segredo e gateway com envio.
- Possível regressão: testes intencionalmente não provam integração Hermes real, que continua fora do escopo.
- Validação: `node tests/hermes/hermes-adapter.test.js` sem Hermes instalado, rede ou credencial.

## Fase J, ajuste 1: metadata e autoridade dos wrappers

- Commit: `hermes: align wrapper metadata and source authority`
- Arquivos: política de fonte, seis wrappers, documentação Hermes, testes e este changelog.
- Antes: wrappers tinham frontmatter mínimo e a separação entre método Claude e operação Hermes não era uma regra centralizada.
- Depois: skills declaram nome slash compatível, descrição, versão e workflow único; política central bloqueia instruções operacionais vindas da fonte Claude.
- Risco mitigado: Hermes executar instrução de runtime Claude por referência ou não descobrir wrapper por metadata padrão.
- Possível regressão: nenhuma execução foi habilitada; wrappers continuam dry-run.
- Validação: teste local de metadata, unicidade, mapeamento de slash command e referência da política.

## Fase J, ajuste 2: gates de approval e capability no cron Hermes

- Commit: `hermes: enforce approval and capability gates in cron adapter`
- Arquivos: adapter/documentação de cron, arquitetura, testes e este changelog.
- Antes: cron só distinguia modes e podia marcar job como agendado sem avaliar escopo, validade, limites ou capability.
- Depois: `evaluateApproval` recebe contexto separado; descriptor é sempre dry-run/não agendado e só workflow local com standing válida fica elegível.
- Risco mitigado: policy fora de escopo, expirada, revogada ou sem uso avaliado tornar cron aparentemente permitido; capability externa virar permissão implícita.
- Possível regressão: chamadores futuros precisam fornecer rede, ação e uso quando a policy os limitar.
- Validação: testes locais de standing válida/inválida, escopo, limites, manual, disabled e workflows externos.

## Fase Claude, lote 1: auditoria funcional atual

- Commit: `docs: map Claude workflow completion status`
- Arquivos: `docs/claude/WORKFLOW-STATUS.md` e este changelog.
- Antes: o inventário arquitetural não distinguia de forma operacional cadeia local coerente de roteiro parcial/legado.
- Depois: os workflows principais têm commands, dependências, I/O, capabilities externas, approval, secrets e lacunas mapeados por leitura estática.
- Risco mitigado: declarar workflow pronto apenas porque existe Markdown ou ativar integração sem boundary/fixture.
- Possível regressão: nenhuma alteração de command, skill, agent, script, Hermes ou estado de produto.
- Validação: inventário estático de árvore, referências de scheduling, secrets e dependências C10X.

## Fase Claude, lote 2: produto e VTSD

- Commit: `claude: complete product and VTSD workflow`
- Arquivos: contrato local Claude de produto, teste com fixture, documentação de invariantes, commands de criar/trocar e status funcional.
- Antes: criação, seleção, atualização de manifesto e não sobrescrita estavam apenas distribuídas em instruções de command e script.
- Depois: o adapter local valida slug/tipo, recusa sobrescrita, confina writes a `meus-produtos/`, atualiza manifesto e é coberto sem tocar produto real; a cadeia VTSD e revisores existentes é preservada.
- Risco mitigado: path traversal, seleção de produto inexistente, sobrescrita silenciosa e manifesto desatualizado.
- Possível regressão: commands continuam a usar seus procedimentos compatíveis; o contrato não executa browser, pesquisa ou painel automaticamente.
- Validação: `node tests/claude/product-vtsd-workflow.test.js` com fixture temporária e sem rede.

## Fase Claude, lote 3: pesquisa de mercado

- Commit: `claude: complete market research workflow`
- Arquivos: adapter/fixture de pesquisa, documentação, skill de compatibilidade, status e este changelog.
- Antes: os nove eixos eram instrucionais, sem contrato local de relatório, source failure ou boundary de provider autenticado.
- Depois: relatório exige nove eixos, data, fonte e separação FATO/INFERÊNCIA; revisor é descrito sem invocação; Apify/Ads Library só produzem descriptor `dry_run` por `SecretProvider`.
- Risco mitigado: pesquisa sem rastreabilidade, token no chat/.env, provider real sem boundary e falha de fonte destruindo a pesquisa anterior.
- Possível regressão: o adapter não executa WebSearch/WebFetch nem o revisor; essas capacidades continuam no runtime Claude quando autorizadas.
- Validação: `node tests/claude/market-research-workflow.test.js` com fonte/segredo mock e sem rede.

## Fase Claude, lote 4: copy e gates de revisão

- Commit: `claude: standardize copy workflows and review gates`
- Arquivos: contrato/teste de copy, documentação, cinco commands, status e changelog.
- Antes: Manual, elementos e revisora eram referenciados por commands, mas não havia gate comum de persistência/saída.
- Depois: cinco IDs de copy têm output previsível, revisão comum e writes confinados; o contrato bloqueia vícios estáticos antes de salvar e mantém a revisora como autoridade editorial.
- Risco mitigado: copy persistida sem revisão, caminho inconsistente ou etapa de mídia/publicação confundida com geração de texto.
- Possível regressão: o gate não tenta reescrever texto nem chamar skill/agent; revisão metodológica completa continua no Claude.
- Validação: `node tests/claude/copy-workflow.test.js` com fixture local.

## Fase Claude, lote 7: falha explícita de High Ticket/C10X

- Commit: `claude: make high ticket dependency failure explicit`
- Arquivos: resolver/status C10X, teste com fixture, documentação, agente HT, status e changelog.
- Antes: o orquestrador preservado descrevia rota `/ht-*` indisponível sem um bloqueio executável que exibisse dependência e estado existente.
- Depois: ausência de `ht-*` resulta em `BLOCKED_EXTERNAL`, com dependências faltantes, artefatos preservados e instrução de retomada; nenhuma aproximação de C10X foi criada.
- Risco mitigado: agente tentar invocar skill ausente, inventar metodologia ou apagar estado High Ticket durante falha.
- Possível regressão: High Ticket permanece bloqueado até o plugin C10X real ser disponibilizado, por design.
- Validação: `node tests/claude/high-ticket-blocked.test.js` sem plugin, rede ou produto real.

## Fase Claude, lote 5: Low Ticket

- Commit: `claude: complete low ticket workflow`
- Arquivos: contrato/teste de Low Ticket, status e changelog.
- Antes: commands LT existentes não possuíam plano de cadeia tipado nem fixture de pré-requisitos/handoff.
- Depois: pesquisa, perfil e consumidor são pré-requisitos; o plano persiste etapas, quiz opcional e handoff de tráfego dry-run com criação futura PAUSED/manual.
- Risco mitigado: partir para anúncios/campanha sem base VTSD ou inferir publicação/checkout.
- Validação: `node tests/claude/low-ticket-workflow.test.js` com fixture local.

## Fase Claude, lote 6: Middle Ticket

- Commit: `claude: complete middle ticket workflow`
- Arquivos: contrato/teste Middle Ticket, status e changelog.
- Antes: a cadeia 8D e o handoff de tráfego dependiam somente do roteiro do agente.
- Depois: contrato local exige pesquisa/perfil/consumidor, persiste as etapas 8D e preserva Meta como handoff dry-run/manual.
- Risco mitigado: tratar criativos ou plano de anúncios como permissão para provider/campanha externa.
- Validação: `node tests/claude/middle-ticket-workflow.test.js` com fixture local.

## Fase Claude, lote 8: páginas

- Commit: `claude: complete page generation workflow`
- Arquivos: adapter/teste de página, status e changelog.
- Antes: build/deploy não tinham contrato local separado.
- Depois: build requer copy revisada, verifica HTML e assets relativos, grava no produto e retorna deploy manual não aprovado.
- Validação: `node tests/claude/page-workflow.test.js` com fixture local.

## Fase Claude, lote 9: carrossel e scheduling

- Commit: `claude: complete carousel generation and scheduling`
- Arquivos: adapter/teste de carrossel, status e changelog.
- Antes: geração, scheduler Claude e publicação podiam ser confundidos; `RELATORIO_CRON_ID` aparecia no mesmo domínio.
- Depois: artefato de conteúdo, descriptor de rotina e publicação são separados; cada rotina tem `schedule_id`, timezone e modo dry-run, sem publicação e sem ID de relatório Ads.
- Validação: `node tests/claude/carousel-workflow.test.js` com fixture local.

## Fase Claude, lote 10: imagem

- Commit: `claude: complete image generation adapters`
- Arquivos: adapter/teste de imagem, status e changelog.
- Depois: OpenRouter/Freepik são allowlisted por capability, secret lógico e runtime injection mock; resultado não contém segredo e artefato fica no produto.
- Validação: `node tests/claude/image-generation.test.js` sem rede.

## Fase Claude, lote 11: vídeo

- Commit: `claude: complete video generation workflow`
- Arquivos: adapter/teste de vídeo, status e changelog.
- Depois: FFmpeg/Remotion são `LOCAL_RENDER` dry-run sem secret; HeyGen/Replicate são `EXTERNAL_RENDER` allowlisted por SecretProvider e mock.
- Validação: `node tests/claude/video-generation.test.js` sem render, rede ou credencial.

## Fase Claude, lote 12: Meta Ads

- Commit: `claude: complete Meta Ads workflow with approval gates`
- Arquivos: adapter/teste Meta, status e changelog.
- Depois: READ/WRITE/FINANCIAL_WRITE são explícitos; aliases convergem para `META_ACCESS_TOKEN`; drafts de campanha são PAUSED; write financeiro falha sem grant manual da ação correta.
- Validação: `node tests/claude/meta-ads-workflow.test.js` com SecretProvider mock e sem API.

## Fase Claude, lote 13: relatório Ads

- Commit: `claude: complete Ads reporting workflow`
- Arquivos: adapter/teste de relatório, status e changelog.
- Depois: período, métricas e análise persistem artefato local; Telegram/WhatsApp/local recebem apenas descriptor `sent:false`; cron de relatório não se mistura com carrossel.
- Validação: `node tests/claude/ads-report.test.js` sem envio.

## Fase Claude, lote 14: dashboards sociais

- Commit: `claude: complete social dashboard workflows`
- Arquivos: adapter/teste de dashboards, status e changelog.
- Depois: Instagram, TikTok, YouTube e LinkedIn têm descriptors individuais Apify, SecretProvider mock, normalização e preservação de cache em erro.
- Validação: `node tests/claude/social-dashboard-workflow.test.js` sem rede.

## Fase Claude, lote 15: publisher orgânico

- Commit: `claude: add approval-gated organic publishing workflow`
- Arquivos: contrato/teste publisher, status e changelog.
- Depois: request usa `autopublish:false`, ApprovalPolicy por plataforma/ação e resultado dry-run sem ID externo; todas plataformas permanecem bloqueadas até adapter oficial comprovado.
- Validação: `node tests/claude/organic-publisher-workflow.test.js` sem publicação.

## Fase Claude, lote 16: executor de plano

- Commit: `claude: harden plan executor workflow`
- Depois: plano aceita tarefas tipadas/registradas e bloqueia workflow desconhecido, risco composto não resolvido e shell arbitrário.

## Fase Claude, lote 17: Toolkit persistente

- Commit: `claude: complete persistent toolkit workflow`
- Depois: roteiro, plano e estado persistem tarefas tipadas; completed não reexecuta e dependência failed/blocked impede filho.

## Fase Claude, lote 18: comercial

- Commit: `claude: complete commercial workflow`
- Depois: comercial geral permanece disponível; módulo High Ticket bloqueia somente a dependência C10X e preserva artefatos.

## Fase Claude, ajuste de secrets e WhatsApp

- Commit: `claude: migrate WhatsApp delivery from Z-API to UAZAPI`
- Depois: UAZAPI é o provider canônico `notification.send`; Z-API e scripts acoplados ficam documentados como legado, sem fluxo novo canônico.

## Fase Claude, boundary canônico Meta Ads

- Commands de conexão, token, insights, análise, criação, otimização, escala e relatório passaram a usar operações Meta allowlisted em vez de `.env`, aliases ou requisições construídas no Markdown.
- `META_ACCESS_TOKEN` é o único segredo lógico canônico; `META_AD_ACCOUNT_ID` e `META_AUTH_MODO` são configuração não secreta. `RELATORIO_AUTH_MODO` permanece somente como `LEGACY_CONFIG`.
- Skills de tráfego com runtime histórico foram preservadas, marcadas `LEGACY_META_RUNTIME` e retiradas da invocação direta; a metodologia não foi apagada.
- A criação continua `PAUSED`; escala é `FINANCIAL_WRITE` e exige grant manual ligado ao `action_id`.

## Fase K: conclusão funcional Claude

- VTSD/produto, pesquisa, copy e revisão passaram a ter contracts e fixtures locais; Low/Middle Ticket persistem planos e High Ticket bloqueia explicitamente a ausência de C10X.
- Página, carrossel, imagem e vídeo foram separados de deploy/publicação/providers reais; imagens, vídeo e pesquisa autenticada usam mocks e SecretProvider.
- Meta Ads foi sanitizado para `META_ACCESS_TOKEN`/`META_AD_ACCOUNT_ID`; leitura, escrita e escrita financeira possuem operations allowlisted, campanhas `PAUSED` e approval manual onde aplicável.
- Ads report foi desacoplado de delivery. UAZAPI é o WhatsApp canônico, Telegram é opcional e Z-API ficou legado.
- Dashboards sociais, publisher dry-run, executor tipado, Toolkit persistente e comercial geral receberam testes locais; publisher permanece bloqueado por provider oficial ausente.
- A integridade de commands, o registry de workflows canônicos e o E2E com fixture temporária cobrem regressão sem rede, segredo ou side effect real.

## Fase K: gates de risco e metodologia Meta

- Plan Executor e Toolkit agora resolvem capabilities, risco externo/financeiro, approval e risco composto a partir do registry. Tarefas que exigem approval iniciam bloqueadas sem policy válida; `ads.scale` exige grant manual do `action_id` exato.
- O registry modela `ads.write` e `ads.financial_write`, impedindo que workflows Meta de escrita pareçam filesystem-only.
- O adapter Meta separa `APP` (SecretProvider com `META_ACCESS_TOKEN`) de `MCP_CONECTOR` (OAuth externo), sem conceder qualquer aprovação de escrita pelo transport.
- As cinco skills de tráfego voltaram a expor metodologia canônica sem `.env`, token, request direta ou runtime específico; leitura e ações usam operations allowlisted.
- O E2E instala guards reais para rede, child processes e writes fora da fixture, todos restaurados ao término do teste.

## Fase K: runtime Meta removido das skills canônicas

- `trafego-insights`, `trafego-analise`, `trafego-criar-campanha`, `trafego-otimizar` e `trafego-escalar` passaram a solicitar exclusivamente operações Meta allowlisted; endpoints, verbos HTTP e aliases `FB_AD_ACCOUNT_*`/`AD_ACCOUNT_ID` saíram da metodologia canônica.
- As leituras necessárias à metodologia foram modeladas no adapter Meta como descriptors dry-run: conta, campanhas, pixels, conversões, audiências, interesses e validação de criativos.
