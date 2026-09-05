# Plano de Regressão Funcional

Executar somente após cada mudança futura, usando dados de teste e `dry-run`; não foram executados nesta fase.

| # | Fluxo | Evidência mínima de aprovação | Proteções |
|---|---|---|---|
| 1 | Produto | cria/seleciona produto e preserva `.ativo`, `perfil.md` e painel | diretório de fixture; sem apagar produto real |
| 2 | Pesquisa | gera pesquisa com os eixos previstos e revisão, salva no produto | fontes/mock; sem token real |
| 3 | Copy | página, anúncio e social usam Manual da Copy e revisão | comparar arquivo de saída e checklist |
| 4 | Revisora | detecta regras críticas sem mutar conteúdo fora do alvo | fixture Markdown |
| 5 | Low Ticket | caminho `lt-funil` até produto, quiz/página/anúncio preserva entregas | sem publicação/checkout vivo |
| 6 | Middle Ticket | concepção, identidade, página 8D e plano de anúncios | Meta em mock/dry-run |
| 7 | Carrossel | produz pauta, copy, legenda e prompts/assets no local esperado | não agenda nem publica |
| 8 | Imagem | adapter valida entrada e produz plano/artefato simulado | provider mock; sem cobrança |
| 9 | Vídeo | roteiro e job de render preservam contratos de arquivos | HeyGen/Replicate mock; FFmpeg isolado |
| 10 | Meta Ads | insights, diagnóstico, preview YAML e campanha `PAUSED` | conta sandbox/mock; aprovação obrigatória |
| 11 | Executor | plano mapeia tarefa à skill/agente certo e registra resultado | sem tarefas destrutivas/externalizadas |
| 12 | Toolkit | `roteiro.md`, `plano.md`, `estado.md` sobrevivem pausar/retomar | fixture por produto |
| 13 | Dashboards sociais | Instagram, TikTok, YouTube e LinkedIn geram os outputs esperados | provider em mock; sem token real |
| 14 | Scheduling de conteúdo | `programar-carrossel` e `programar-carrossel-noticia` montam job, persistem `schedule_id` e respeitam cron/timezone | nenhum publish real |
| 15 | Relatório Ads | geração imediata, configuração e Telegram/WhatsApp em mock; contrato do futuro scheduler neutro | separado de agendamento de carrossel; sem envio real |
| 16 | High Ticket indisponível | `estrategista-ht` informa dependência `ht-*` ausente sem quebrar, inventar execução ou remover dados | fixture sem plugin externo |
| 17 | Runtime Hermes | `HERMES.md` carrega, skills allowlisted são encontradas, wrapper chama workflow correto, delegate recebe contexto mínimo e cron monta job no workdir correto | nenhum segredo no prompt |

## Critérios transversais

- Compatibilidade Claude: command existente continua encontrando seu roteiro/skill.
- Compatibilidade Codex: `AGENTS.md` ainda permite execução manual orientada.
- Sem chamada externa em casos declarados `dry-run`.
- Sem segredo no log, fixture ou artefato.
- Toda escrita fica no diretório do produto de teste.
- Falhas informam o job/etapa e não deixam aprovação como `published` ou `approved` indevidamente.
- Casos com `ApprovalPolicy` validam `manual`, `standing` dentro de escopo/validade e `disabled` como bloqueio; `autopublish` inicia como `false`.
