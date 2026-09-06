# Status funcional dos workflows Claude

Data: 2026-09-06. Método: leitura estática de commands, agents, skills, scripts, painel e core. Nenhum script, hook, API, provider, vault, cron, gateway ou credencial foi executado.

## Critério desta linha de base

- `READY`: cadeia local coerente, com entradas, saída e validação verificável.
- `PARTIAL`: roteiro existe, mas há lacuna de contrato, write, segurança, routing ou teste.
- `BROKEN`: falta uma peça local exigida para a cadeia declarada ou a separação de responsabilidades é incoerente.
- `BLOCKED_EXTERNAL`: depende de componente externo ausente que não pode ser aproximado.
- `LEGACY`: compatibilidade preservada, mas não deve ser fluxo principal.

Nesta auditoria, existência de Markdown não prova `READY`.

| Workflow | Command, skills, agents e scripts | Entradas, saídas e writes | Externo, approval e secrets | Status atual e gap |
| --- | --- | --- | --- | --- |
| Produto / VTSD | `produto-novo`, `produto-trocar`, `produto-concepcao`, `produto-consumidor`; `concepcao-produto`, `vtsd-completo`; estrategista e revisores; `painel-*.py` | `.ativo`, perfil, tipo, preço, consumidor, pesquisa e painel em `meus-produtos/{slug}/` | Pesquisa pública; sem secret para fluxo local; writes locais validam slug | `READY`: contrato local e fixture cobrem criação, seleção, manifesto, não sobrescrita e confinement; VTSD/revisores permanecem fontes compatíveis. |
| Pesquisa de mercado | `produto-concepcao`; skill `pesquisa-mercado`; agent/revisor-pesquisa | contexto VTSD → `pesquisa-mercado.md` | WebSearch/WebFetch público; Apify/Ads Library usam boundary/mock; revisor descriptor | `READY_EXTERNAL`: nove eixos, data, fonte e distinção fato/inferência são validados; providers autenticados retornam somente dry-run e preservam artefato em falha. |
| Revisores | agents `revisor-pesquisa`, `revisor-perfil`, `revisor-idconsumidor`; skill `revisora` para copy | arquivos de contexto e retornos locais | sem secret; nenhuma integração externa necessária | `PARTIAL`: integração é instrucional, sem contrato/output de revisão testável. |
| Copy página | `copy-pagina`; `paginas`, `elementos-literarios`, `revisora` | perfil, consumidor, pesquisa → `entregas/copy-pagina/` | sem provider para texto; aprovação editorial | `READY`: contrato comum exige 16 blocos, revisão e saída previsível local. |
| Copy anúncio | `copy-anuncio`; `anuncios`, `anuncios-texto`, `revisora` | contexto → `entregas/criativos/` | texto local; mídia opcional é provider separado; Meta write exige manual | `READY_EXTERNAL`: copy e revisão locais estão fechadas; opções de mídia seguem adapter externo posterior, nunca Meta write implícito. |
| Copy social | `copy-social`; `conteudo`, `elementos-literarios`, `revisora` | contexto → `entregas/conteudo-social/` | sem publicação nesta etapa; aprovação editorial | `READY`: output e gate de revisão são comuns e testados; publicação é outro workflow. |
| Copy roteiro / variações | `copy-roteiro`, `copy-variacao-post`; `revisora` | contexto → roteiro/conteúdo local | variação usa dashboard como fonte externa; aprovação editorial | `READY_EXTERNAL`: saída/revisão local fechadas; variação depende de dashboard já configurado e renderização é separada. |
| Low Ticket | `lt-funil`, `lt-criar-produto`, `lt-quiz`, `lt-pagina`, `lt-otimizar`; agent LT | pesquisa, perfil e consumidor → oferta, produto, quiz opcional, página, copy, anúncios e plano em `entregas/funil/` | Meta somente mock/manual; checkout nunca automático | `READY_EXTERNAL`: contrato local valida pré-requisitos, persiste plano tipado e deixa handoff de tráfego em dry-run/PAUSED. |
| Middle Ticket | `produto-concepcao`, `copy-pagina`, `copy-anuncio`; agent MT | pesquisa, identidade, oferta, página 8D, copy, criativos e plano em `entregas/funil/` | Meta write manual; providers de mídia isolados | `READY_EXTERNAL`: plano testado exige contexto VTSD e entrega handoff Meta como dry-run sem capability externa. |
| High Ticket / C10X | `estrategista-ht`, consultor e referências `/ht-*` | preserva estado e relata `entregas/ht/` existentes | skills C10X não existem localmente | `BLOCKED_EXTERNAL`: resolver testado identifica `ht-*` ausentes, explica retomada e não inventa/metodologia nem apaga dados. |
| Carrossel | `carrossel`; skills `carrossel`, `carrossel-visual`, `conteudo` | pauta, slides, legenda, CTA e prompts → artefato em conteúdo social | imagem é externa; publicação é separada | `READY_EXTERNAL`: artefato exige slides/prompts pareados e inicia com `autopublish:false`; assets externos continuam em adapter próprio. |
| Carrossel notícia | `programar-carrossel-noticia`; skill homônima | configuração de rotina e conteúdo local | schedule dry-run; não publica | `READY`: descriptor separado persiste `schedule_id` próprio e timezone, sem chamar `/schedule`. |
| Scheduling de conteúdo | skill `programar-carrossel` e command de notícia | `agendamentos/carrossel/{slug}.md` e `schedule_id` por rotina | schedule dry-run; aprovação de publicação futura | `READY`: geração, schedule e publish são separados; `RELATORIO_CRON_ID` é explicitamente nulo/inaplicável. |
| Imagem | `criativo-estatico`, `img-anuncio`, `furadeira-visual`; scripts legados | brief/prompt → artefato em `entregas/criativos/` | OpenRouter/Freepik via `image.generate`, secret lógico e mock | `READY_EXTERNAL`: adapter canônico allowlista provider/operação, usa SecretProvider sem plaintext e tem contrato de artefato/mock; scripts `.env` são compatibilidade legada. |
| Vídeo | `video-heygen`, `video-remotion`, `video-editar`, `video-efeitos`; video-maker; scripts legados | roteiro/assets → `entregas/videos/` | FFmpeg/Remotion local; HeyGen/Replicate via `video.generate` e secret lógico | `READY_EXTERNAL`: renderer local retorna plano dry-run sem secret; externo usa adapter/mock e contrato job/resultado; `.env` legado não é caminho canônico. |
| Meta Ads insights | `trafego-conexao`, `trafego-insights`, `trafego-analise`; skills tráfego | configuração → métricas/diagnóstico local | `ads.insights`, token lógico canônico e mock | `READY_EXTERNAL`: adapter classifica READ e não expõe aliases/plaintext; execução permanece dry-run. |
| Meta Ads criação | `trafego-criar-campanha`; agent campanhas | preview → campanha/adsets/ads | WRITE, SecretProvider e manual por ação | `READY_EXTERNAL`: draft canônico sempre nasce `PAUSED`; mock exige grant manual correspondente. |
| Meta Ads otimização | `trafego-otimizar` | diagnóstico → plano de ações | WRITE, manual por ação | `READY_EXTERNAL`: operação allowlisted e fail-closed por approval, sem request real. |
| Meta Ads escala | `trafego-escalar` | métricas → proposta de escala | FINANCIAL_WRITE, manual obrigatório | `READY_EXTERNAL`: aumento/ativação/escala só passam com grant manual do `action_id`; sem API real. |
| Ads relatório | `ads-relatorio`, `enviar-relatorio-ads`; `relatorio-ads-cli.py` | período/métricas/análise → Markdown e descriptor de destino | Meta read; Telegram/WhatsApp apenas dry-run | `READY_EXTERNAL`: relatório e entrega estão separados de conteúdo; `sent:false` em mock e `RELATORIO_CRON_ID` é exclusivo do relatório. |
| Dashboards sociais | skills Instagram, TikTok, YouTube e LinkedIn; scripts internos | handles/configuração → HTML, insights, histórico e cache local | fontes/APIs externas, normalmente Apify; requer secret boundary | `PARTIAL`: quatro fluxos não compartilham adapter/mock de provider. |
| Páginas | `copy-pagina`, `pagina-*`, `pagina-visual`, feedback; `montar-pagina-copias.py` | copy revisada → HTML/assets em `entregas/paginas/` | deploy Vercel/Lovable separado e manual | `READY`: build exige copy aprovada, valida estrutura/paths relativos e escreve somente no produto; deploy não é autorizado. |
| Publisher orgânico | não há command/adapters de publisher comprovados | conteúdo aprovado → resultado de publicação | rede, secret e approval por plataforma | `BROKEN`: não há integração oficial comprovada; somente handoff manual deve ser considerado. |
| Executor de plano | agent `executor-de-plano-de-acao`; commands/skills apontados pelo plano | plano → tarefas/saídas do produto | pode alcançar qualquer capability; children determinam risco | `PARTIAL`: aceita roteamento amplo sem tarefa tipada/fail-closed testado. |
| Toolkit | `toolkit-novo`, `planejar`, `executar`, `progresso`, `pausar`, `retomar`, `verificar`, `anotar` | `roteiro.md`, `plano.md`, `estado.md` em `projeto/{slug}/` | ações filhas exigem gates próprios | `PARTIAL`: persistência existe como roteiro, mas pausa/falha/retomada não têm regressão de fixture. |
| Comercial | `comercial-playbook`, `estrategia-funil`, `estrategia-lancamento`; consultor | contexto → playbook/material comercial | HT depende de C10X; outputs locais | `PARTIAL`: precisa isolar etapa HT bloqueada do comercial Low/Middle funcional. |

## Lacunas transversais encontradas

1. Vários commands ainda instruem leitura/escrita de `.env` ou `curl` com secrets, apesar da política 1Password prevalecer.
2. `programar-carrossel-noticia` ainda depende de `/schedule`; isso não é publicação e não substitui o contrato de scheduling.
3. Meta, imagem, vídeo, dashboards e notificações precisam de adapters capability-first, mock/dry-run, SecretProvider e gates antes de qualquer chamada real.
4. `pagina-vercel`, `pagina-lovable`, `pagina-active` e fluxos de checkout são compatibilidade externa/legada e não podem ser tratados como entrega local pronta.
5. `ht-*` é a única dependência explicitamente ausente mapeada: deve terminar em `BLOCKED_EXTERNAL`, preservando dados.

## Próxima classificação esperada

Os lotes seguintes devem eliminar `PARTIAL` e `BROKEN`, resultando apenas em `READY`, `READY_EXTERNAL`, `BLOCKED_EXTERNAL` ou `LEGACY`. Cada `READY_EXTERNAL` deverá registrar provider, segredo lógico, approval, mock test, command de entrada e artefato de saída.
