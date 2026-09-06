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
| Copy página | `copy-pagina`; `paginas`, `elementos-literarios`, `revisora` | perfil, consumidor, pesquisa → `entregas/copy-pagina/` | sem provider para texto; aprovação editorial | `PARTIAL`: revisão comum e contrato de saída não são impostos por teste. |
| Copy anúncio | `copy-anuncio`; `anuncios`, `anuncios-texto`, `revisora` | contexto → `entregas/anuncios/` | geração opcional de mídia usa provider; Meta write exige manual | `PARTIAL`: command ainda contém caminhos `.env`/provider e mistura copy com mídia. |
| Copy social | `copy-social`; `conteudo`, `elementos-literarios`, `revisora` | contexto → `entregas/conteudo-social/` | sem publicação nesta etapa; aprovação editorial | `PARTIAL`: output e revisão não têm contrato comum testado. |
| Copy roteiro / variações | `copy-roteiro`, `copy-variacao-post`; `revisora` | contexto → roteiro/conteúdo local | sem secret para texto; aprovação editorial | `PARTIAL`: caminhos e gate de revisão não estão padronizados. |
| Low Ticket | `lt-funil`, `lt-criar-produto`, `lt-quiz`, `lt-pagina`, `lt-otimizar`; agent LT | pesquisa, perfil e tipo → produto, quiz, página, copy e anúncios | Meta somente mock/manual; checkout nunca automático | `PARTIAL`: cadeia completa não possui fixture de regressão. |
| Middle Ticket | `produto-concepcao`, `copy-pagina`, `copy-anuncio`; agent MT | pesquisa e identidade → página 8D, criativos e plano | Meta write manual; providers de mídia isolados | `PARTIAL`: handoff de tráfego e artefatos não possuem contrato testado. |
| High Ticket / C10X | `estrategista-ht`, consultor e referências `/ht-*` | deve preservar estado de produto existente | skills C10X não existem localmente | `BLOCKED_EXTERNAL`: `ht-*` ausentes, conforme mapa C10X; não aproximar metodologia. |
| Carrossel | `carrossel`; skills `carrossel`, `carrossel-visual`, `conteudo` | pauta, slides, legenda, CTA e prompts → conteúdo/criativos do produto | imagem é externa; publicação é separada | `PARTIAL`: geração e artefato final não têm contrato único. |
| Carrossel notícia | `programar-carrossel-noticia`; skill homônima | configuração de rotina e conteúdo local | usa `/schedule` Claude; não publica por si | `PARTIAL`: acoplado ao scheduler Claude e sem boundary neutro/local de teste. |
| Scheduling de conteúdo | skill `programar-carrossel` e command de notícia | `agendamentos/carrossel/{slug}.md` e `schedule_id` por rotina | `/schedule`; approval de publicação futura | `BROKEN`: command físico para `programar-carrossel` não está presente e scheduling não é separado por contrato Claude testado. |
| Imagem | `criativo-estatico`, `img-anuncio`, `furadeira-visual`; scripts `gerar-*.py`, `generate-creative.py` | brief/prompt → criativos/artefatos locais | `image.generate`; OpenRouter/Freepik/Replicate via 1Password futuro | `PARTIAL`: scripts/commands ainda leem `.env` e não há adapter mock único. |
| Vídeo | `video-heygen`, `video-remotion`, `video-editar`, `video-efeitos`; video-maker; scripts vídeo | roteiro/assets → `entregas/videos/` | HeyGen/Replicate externos; FFmpeg/Remotion locais | `PARTIAL`: separação local/external e job mock não estão consolidados; comandos legados leem `.env`. |
| Meta Ads insights | `trafego-conexao`, `trafego-insights`, `trafego-analise`; skills tráfego | configuração → métricas/diagnóstico local | `ads.insights`; aliases Meta e `.env` legado; read sem side effect | `PARTIAL`: não usa adapter canônico/SecretProvider e não há mock completo. |
| Meta Ads criação | `trafego-criar-campanha`; agent campanhas | preview → campanha/adsets/ads | write financeiro; `manual` obrigatório; campanha deve nascer `PAUSED` | `PARTIAL`: command ainda chama runtime/API legado; approval não está conectado ao core. |
| Meta Ads otimização | `trafego-otimizar` | diagnóstico → plano de ações | writes potencialmente irreversíveis/financeiros | `PARTIAL`: gate conversacional legado, sem ApprovalPolicy executável. |
| Meta Ads escala | `trafego-escalar` | métricas → proposta de escala | aumento de orçamento/ativação, `manual` obrigatório | `PARTIAL`: aliases e chamadas `.env` legadas; sem mock/gate de contrato. |
| Ads relatório | `ads-relatorio`, `enviar-relatorio-ads`; `relatorio-ads-cli.py` | período/métricas → Markdown/HTML e destino | Meta read; Telegram/WhatsApp externos com gate | `PARTIAL`: envio e `.env` legados; scheduler é distinto e documentação ainda inconsistente. |
| Dashboards sociais | skills Instagram, TikTok, YouTube e LinkedIn; scripts internos | handles/configuração → HTML, insights, histórico e cache local | fontes/APIs externas, normalmente Apify; requer secret boundary | `PARTIAL`: quatro fluxos não compartilham adapter/mock de provider. |
| Páginas | `copy-pagina`, `pagina-*`, `pagina-visual`, feedback; `montar-pagina-copias.py` | copy aprovada → HTML/assets em `entregas/paginas/` | deploy Vercel/Lovable separado e aprovado | `PARTIAL`: referências a scripts deprecated/ausentes coexistem com fluxo atual. |
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
