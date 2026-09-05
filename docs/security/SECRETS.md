# Política de Segredos

## Regra operacional

1Password é a fonte de verdade dos segredos. Segredos nunca são solicitados, recebidos, repetidos, validados ou gravados pelo chat. Não devem aparecer em argumento CLI, URL, header, log, artefato, commit ou teste. Workflows mantêm somente referências `op://` em `.env.op` local e usam `op run` para injeção em runtime. O modelo só conhece nome lógico, referência e status booleano, nunca plaintext. `.env` é `LEGACY_SECRET_FLOW` até migração individual.

## Inventário estático de fluxos a migrar

| Área | Entradas/variáveis | Situação nesta fase |
|---|---|---|
| Imagem e vídeo | `OPENROUTER_API_KEY`, `HEYGEN_API_KEY`, `REPLICATE_API_TOKEN` | Commands de configuração receberam política externa; integrações permanecem. |
| Pesquisa e dados | `APIFY_API_TOKEN` e credenciais de dashboards sociais | Provisionamento externo obrigatório; scripts não foram reescritos nesta fase. |
| Meta Ads | tokens Meta/Facebook, Pixel/CAPI e IDs de conta | Fluxos `trafego-*`, `ads-relatorio` e geração de token precisam de revisão por adapter/gate. |
| Notificações | `TELEGRAM_BOT_TOKEN`, Z-API e WhatsApp | Provisionamento externo obrigatório; envio real não é executado nesta fase. |
| Página e publicação | Vercel, Lovable, ActiveCampaign, checkout e providers | Integrações preservadas; configuração por chat será revisada por fluxo antes de uso. |

## Commands cobertos diretamente

`configurar-apify`, `configurar-heygen`, `configurar-imagens`, `configurar-replicate`, `configurar-telegram` e `configurar-zapi` foram marcados para não coletar nem testar segredos conversacionalmente. `ads-relatorio`, `trafego-*`, `pagina-*`, `video-heygen` e outros comandos que ainda descrevem valores sensíveis são inventariados como pendências de adapter: a política global em `CLAUDE.md` e `AGENTS.md` prevalece até a revisão individual.

## Operação segura

1. O operador configura a credencial fora da conversa.
2. O workflow verifica somente presença/configuração autorizada.
3. O adapter realiza a chamada futura sem imprimir ou aceitar valor pelo prompt.
4. Logs usam identificadores mascarados ou status booleano.

Nunca use valor real em fixture, teste, documentação ou comando.
