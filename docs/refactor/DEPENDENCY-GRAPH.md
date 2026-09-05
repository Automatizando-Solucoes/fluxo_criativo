# Grafo de Dependências

Base: `b869032`; análise estática em 2026-09-05. Setas indicam dependência operacional/documental, não execução observada.

## Fluxos essenciais

```text
produto-novo / produto-concepcao
  -> estado em meus-produtos/{slug}
  -> pesquisa-mercado -> revisor-pesquisa
  -> gerador-decorados + gerador-urgencias-ocultas + revisor-perfil
  -> gerador-idconsumidor -> revisor-idconsumidor
  -> painel-incremental/painel-atualizar

copy-pagina | copy-anuncio | copy-social | copy-roteiro
  -> perfil + idconsumidor + pesquisa
  -> revisora/references/manual-copy.md
  -> entrega em meus-produtos/{slug}/entregas

estrategista-low-ticket | estrategista-middle-ticket
  -> concepcao-produto + pesquisa-mercado
  -> copy/páginas/anúncios
  -> painel e entregas

executor-de-plano-de-acao
  -> plano de ação -> command/skill/agente específico -> estado/entrega
```

## Agente para skill/command

| Origem | Destinos diretos identificados |
|---|---|
| `estrategista-de-produto` | `produto-novo`, `produto-concepcao`, `produto-trocar`, `pesquisa-mercado`, `gerar-furadeira`, `furadeira-visual` |
| `copywriter` | `copy-pagina`, `copy-anuncio`, `copy-social`, `copy-roteiro`, `copy-variacao-post`, `elementos-literarios`, `revisora` |
| `construtor-de-paginas` | `copy-pagina`, `pagina-*`, `pagina-visual`, `ui-reverse-engineer`, `paginas` |
| `criador-de-campanhas` | `trafego-conexao`, `copy-anuncio`, `criativo-estatico`, `trafego-*`, `lt-otimizar` e referências `ht-*` |
| `estrategista-low-ticket` | `lt-funil`, `lt-criar-produto`, `lt-quiz`, `lt-pagina`, `copy-anuncio` |
| `estrategista-middle-ticket` | `concepcao-produto`, `copy-pagina`, `copy-anuncio`, `trafego-criar-campanha` |
| `estrategista-ht`, `consultor-comercial` | família `/ht-*`; `comercial-playbook` para low/middle |
| `video-maker` | `copy-roteiro`, `video-heygen`, `video-remotion`, `video-editar`, `video-efeitos`, VSL |
| `executor-de-plano-de-acao` | qualquer command/skill mapeado pelo plano; demanda aprovação antes de tarefas |
| `clonador-de-bloco-visual` | `ui-reverse-engineer`, copy aprovada e manifest de seções |

## Command/skill para script e API

| Fluxo | Script/adaptador atual | Integração ou efeito |
|---|---|---|
| Página e painel | `painel-incremental.py`, `painel-atualizar.py`, `montar-pagina-copias.py` | HTML/manifest local; `pagina-vercel` e `pagina-lovable` podem publicar |
| Playbook comercial | `playbook-briefing.py`, `playbook-montar.py`, `playbook-aplicar-criativas.py` | arquivos temporários e HTML local; command instrui subagentes Claude |
| Criativos | `gerar-criativo-estatico.py`, `gerar-carrossel-foto.py`, `generate-creative.py` | OpenRouter, Freepik e, em fluxos específicos, Replicate/Higgsfield |
| Avatar/vídeo | `generate-avatar-video.py`, `animar-criativo.py`, `otimizar-video-scrub.py` | HeyGen/Replicate ou binários Remotion/FFmpeg |
| Pesquisa e dashboards | scripts sob skills de Apify/Instagram/TikTok/LinkedIn/YouTube | APIs e páginas públicas; grava dashboards/insights |
| Tráfego | `trafego_fetch.py`, `fetch-ad-insights.py`, `relatorio-ads-cli.py`, `relatorio-ads.ps1` | Meta Graph API, dados de Ads; relatórios podem enviar Telegram/Z-API |
| Análise avançada | `scripts/trafego-analysis/` | clientes Meta, Google e Hotmart definidos no pacote Python |
| Agendamento de carrossel | `programar-carrossel`, `programar-carrossel-noticia` | Claude `/schedule`; cada Routine possui `schedule_id` próprio, registrado em `meus-produtos/{ativo}/agendamentos/carrossel/{slug}.md` |
| Relatório Ads | `ads-relatorio`, `enviar-relatorio-ads`, `relatorio-ads-cli.py`, `relatorio-ads.ps1` | Fluxo separado; `RELATORIO_CRON_ID` pertence historicamente ao agendamento do relatório Ads. A documentação e o scheduling atuais são inconsistentes e exigem reconciliação antes de um scheduler neutro. |

## Hooks para evento

| Evento Claude | Hooks | Efeito |
|---|---|---|
| `SessionStart` | `setup-node.sh`, `gsd-check-update.js`, `gsd-session-state.sh` | Instalação automática, consulta npm em background e estado GSD |
| `PreToolUse` | `no-emdash-guard.js`, `gsd-prompt-guard.js`, `gsd-read-guard.js`, `gsd-workflow-guard.js`, `gsd-validate-commit.sh` | Valida escrita e comandos |
| `PostToolUse` | `gsd-context-monitor.js`, `gsd-phase-boundary.sh`, `copy-review.js`, `painel-validar.js`, `agent-status-writer.js` | Validações, estado local e telemetria remota opcional |
| `statusLine` | `gsd-statusline.js` | Lê estado local/usuário e escreve bridge em temporário |

## Pontos de desacoplamento prioritários

1. `meus-produtos/` permanece estado de negócio, acessado por workflows neutros.
2. Commands devem apontar para um identificador de workflow, em vez de chamar `Skill`, `Agent`, `/schedule` ou MCP diretamente.
3. APIs devem estar atrás de adaptadores: Meta, imagem, vídeo, pesquisa, notificação e publicação social.
4. Hooks devem ser políticas locais de runtime, fora da lógica de negócio.
5. Operações externas devem avaliar uma `ApprovalPolicy` persistida antes do adaptador; ações financeiras e irreversíveis permanecem manuais por padrão.

## Modelo de aprovação futuro

```text
ApprovalPolicy

mode:
  manual
  standing
  disabled

scope:
  workflow
  network
  action_type
  product

expires_at:
limits:
revocable:
```

`disabled` significa que a ação não está autorizada, não ausência de aprovação. A política permite autorização por ação ou autorização contínua com escopo, limites e revogação registrados.

## Lacunas verificadas

Há referências documentais a scripts que não estão versionados no caminho citado, por exemplo `workshop-merge-pagina.py`, `build-painel-entregas.py`, `build-pagina-vendas.py` e alguns scripts relativos de skills. Elas devem ser verificadas por fluxo durante a regressão, sem serem recriadas nesta fase.
