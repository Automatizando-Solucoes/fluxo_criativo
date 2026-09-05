# Inventário de Componentes

Data: 2026-09-05
Base analisada: `b869032590a6b916349d30e336bdab93d801cb43`
Método: leitura estática. Nenhum hook, instalador, script operacional, API ou credencial foi executado.

## Critério

`SAFE` é preservável no core ou em um adapter. `REVIEW` exige revisão de segurança, contrato ou runtime antes de migrar. `REWRITE` exige uma implementação neutra. `REMOVE` é candidato à remoção após regressão. `LEGACY` é mantido só para compatibilidade até existir substituto validado.

## Contexto e estado

| Componente | Finalidade e dependências | I/O e risco | Classe |
|---|---|---|---|
| `AGENTS.md` | Manual de operação Codex; encaminha para commands, skills e estado de produto. | Lê/escreve conceitualmente `meus-produtos/`; depende de `.claude/`. | REVIEW |
| `CLAUDE.md` | Especificação funcional de referência do runtime Claude Code, incluindo comandos, APIs e hooks. | Continua durante a compatibilidade Claude; não copiar instruções específicas de runtime para o core. Só poderá ser depreciado depois de core neutro + adapter Claude terem regressão validada. | REVIEW / COMPATIBILITY |
| `ARQUITETURA.md`, `README.md`, `COMO-USAR.md` | Documentação de produto e operação. | Sem execução direta; devem ser reconciliados após a migração. | REVIEW |
| `meus-produtos/{slug}/` e `.ativo` | Fonte de verdade por produto: perfil, pesquisa, identidade, entregas e toolkit. | Escrita local, inclusive exclusão por comandos de produto. | SAFE |
| `.claude/agents-memory/` | Preferências e aprendizado por agente. | Escrita local; não deve conter segredos. | REVIEW |
| `.env.example` | Catálogo de integrações opcionais. | Não contém valores, mas os fluxos atuais pedem que o usuário os forneça no chat. | REVIEW |
| `painel/` e `meus-produtos/index.js` | Painéis e manifestos locais. | Escrita por scripts; pode publicar conteúdo localmente em HTML. | REVIEW |

## Agentes

| Agente | Papel, dependências e chamados | Escrita/impacto | Classe |
|---|---|---|---|
| `estrategista-de-produto` | Orquestra produto VTSD, pesquisa, concepção e identidade. | Atualiza estado do produto. | REVIEW |
| `estrategista-low-ticket` | Fluxo Low Ticket; depende de pesquisa, copy e páginas. | Gera produto, quiz, páginas e anúncios. | REVIEW |
| `estrategista-middle-ticket` | Fluxo Middle Ticket; concepção, identidade, página 8D e tráfego. | Gera entregas e pode encaminhar a Meta. | REVIEW |
| `estrategista-ht` | Orquestra C10X através de `/ht-*`. | Deve ser preservado; a dependência externa das skills está ausente e bloqueia execução. Não implementar aproximações. | REVIEW / BLOCKED_EXTERNAL |
| `copywriter` | Encaminha copy para skills e revisora. | Escreve entregas de copy. | SAFE |
| `construtor-de-paginas` | Encaminha páginas, templates e clonagem visual. | Gera HTML; pode encaminhar a publicação. | REVIEW |
| `criador-de-campanhas` | Orquestra anúncios e tráfego. | Pode chegar a operações Meta. | REVIEW |
| `consultor-comercial` | Orquestra playbooks e HT comercial. | Gera material comercial; depende de HT ausente. | REVIEW |
| `executor-de-plano-de-acao` | Transforma plano em tarefas e aciona skills/agentes. | Executa escrita e pode alcançar integrações. | REVIEW |
| `pesquisa-mercado` | Pesquisa de nove eixos, insumo obrigatório de posicionamento. | Rede e escrita em `pesquisa-mercado.md`. | REVIEW |
| `revisor-pesquisa`, `revisor-perfil`, `revisor-idconsumidor` | Revisão determinística/semântica dos insumos VTSD. | Leitura e comentários/escrita local. | SAFE |
| `gerador-decorados`, `gerador-urgencias-ocultas`, `gerador-idconsumidor` | Geração especializada a partir de pesquisa/perfil. | Escrita local no produto. | SAFE |
| `clonador-de-bloco-visual` | Replica seção HTML a partir de print e copy. | Gera HTML; consome imagem fornecida. | REVIEW |
| `video-maker` | Encaminha HeyGen, Remotion, FFmpeg e VSL. | Pode usar APIs e binários locais. | REVIEW |

## Commands e skills

Os comandos são roteiros Claude, não executáveis independentes. As 52 skills com `SKILL.md` formam a maior parte da inteligência e devem continuar como fonte inicial, sem duplicação.

| Grupo | Componentes | Dependências principais | Classe |
|---|---|---|---|
| Produto/VTSD | `produto-*`, `concepcao-produto`, `vtsd-completo`, `gerar-furadeira`, `furadeira-visual`, `pesquisa-mercado` | estado de produto, pesquisa, revisores, painel | REVIEW |
| Copy | `copy-pagina`, `copy-anuncio`, `copy-social`, `copy-roteiro`, `copy-variacao-post`, `elementos-literarios`, `revisora` | Manual da Copy em `revisora/references/manual-copy.md` | SAFE |
| Low/Middle | `lt-*`, `criacao-produto-low-ticket`, `paginas`, `pagina-*` | perfil, pesquisa, identidade, copy, scripts HTML | REVIEW |
| Social | `carrossel`, `copy-social`, `programar-carrossel-noticia`, dashboards Instagram/TikTok/LinkedIn/YouTube | pesquisa, OpenRouter/Freepik/Apify, `/schedule` | REVIEW |
| Criativos e vídeo | `criativo-estatico` e 28 subformatos, `usar-referencia-visual`, `banner-visual`, `video-*` | OpenRouter, Freepik, Replicate, HeyGen, FFmpeg/Remotion | REVIEW |
| Tráfego | `trafego-conexao`, `trafego-insights`, `trafego-criar-campanha`, `trafego-otimizar`, `trafego-escalar`, `trafego-analise`, `ads-relatorio` | Meta MCP/OAuth ou `.env`, Graph API, Telegram/Z-API | REVIEW |
| Comercial | `comercial-playbook`, `estrategia-funil`, `estrategia-lancamento` | perfil/identidade, subagentes e scripts de montagem | REVIEW |
| Toolkit | `toolkit-novo`, `toolkit-planejar`, `toolkit-executar`, `toolkit-*` | `roteiro.md`, `plano.md`, `estado.md` | SAFE |
| Compatibilidade | `meta-conexao`, `pagina-de-vendas`, `produto-consumidor`, `gerar-token-facebook-ads` | aliases e fluxos substituídos | LEGACY |
| C10X | referências `/ht-*` | plugin externo não presente | LEGACY |

## Hooks, configurações e distribuição

| Componente | Achado estático | Classe |
|---|---|---|
| `.claude/settings.json` | Permite `WebFetch(*)`, `WebSearch(*)`, `Bash(python3)`, Vercel e instala/aciona hooks em todos os eventos. | REWRITE |
| `hooks/setup-node.sh` | Instala Node/Homebrew/nvm/apt/winget, usa `curl | bash` e `sudo` no SessionStart. | REMOVE |
| `hooks/agent-status-writer.js` | Escreve status local; também lê `WORKSHOP_TOKEN`/`WORKSHOP_API_URL` e faz POST remoto opcional. | REWRITE |
| `hooks/copy-review.js`, `no-emdash-guard.js`, `painel-validar.js` | Valida texto/artefatos locais. | REVIEW |
| hooks `gsd-*` | Estado, guardas, status e atualização GSD; `gsd-check-update.js` executa `npm view` em background. | LEGACY |
| `instalador/script-mac.sh`, `instalador/script-windows.txt` | Instalam ferramentas, clona outro URL, usam `npm install`; Windows pede admin. | LEGACY |
| `package.json` e `scripts/notarize.js` | Electron declarado, mas diretório `electron/` não existe no commit. Build Windows solicita administrador. | REWRITE |

## Scripts e integrações

| Grupo | Arquivos representativos | Rede/segredo/impacto | Classe |
|---|---|---|---|
| Painel/local | `painel-*.py`, `painel_template.py`, `montar-pagina-copias.py`, `playbook-*.py` | Escrita local; alguns comandos invocam subprocessos. | REVIEW |
| Imagem | `gerar-criativo-estatico.py`, `gerar-carrossel-foto.py`, `generate-creative.py`, `generate-openrouter-nano-banana-images.py` | OpenRouter/Freepik; API keys; custo variável. | REVIEW |
| Vídeo | `generate-avatar-video.py`, `animar-criativo.py`, `otimizar-video-scrub.py` | HeyGen/Replicate ou FFmpeg; custo/arquivos grandes. | REVIEW |
| Meta/relatórios | `relatorio-ads-cli.py`, `relatorio-ads.ps1`, skills `trafego-*/scripts` | Graph API, dados de conta e potencial ação financeira. | REVIEW |
| Pesquisa/dashboards | scripts em `biblioteca-anuncios`, `pesquisa-mercado-instagram`, dashboards sociais | Apify/plataformas públicas; tokens possíveis. | REVIEW |
| Análise Python | `scripts/trafego-analysis/` | Pacote isolado com testes e clientes Meta/Google/Hotmart. | REVIEW |
| Migrações/correções | `corrigir-*`, `migrar-*`, `uniformizar-*` | Escrita ampla em entregas; escopo precisa ser confirmado. | LEGACY |

## Conclusões do inventário

O negócio e a metodologia vivem sobretudo em Markdown, nas skills e no estado de `meus-produtos`, não no runtime. Os principais acoplamentos são comandos/hook settings do Claude, `/schedule`, ferramenta `Skill`/`Agent`, MCP Meta e scripts que leem `.env`. Nenhum componente foi removido ou alterado nesta fase.
