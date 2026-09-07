# Migração do provider WhatsApp

| Provider | Status | Contrato |
| --- | --- | --- |
| UAZAPI | CANONICAL | `notification.send`; `UAZAPI_BASE_URL` e `RELATORIO_WHATSAPP_NUMERO` são config; `UAZAPI_TOKEN` é segredo 1Password. O descriptor usa `POST /send/text`, sempre `sent:false`/`dry_run:true` nesta fase. |
| Telegram | CANONICAL OPTIONAL DELIVERY | `notification.send`; `TELEGRAM_CHAT_ID` é config e `TELEGRAM_BOT_TOKEN` é segredo lógico. Sem envio real nesta fase. |
| Z-API | LEGACY / NOT USED | Não participa de workflow canônico. `configurar-zapi` e referências históricas são somente compatibilidade/migração. |

Arquitetura aprovada: `Meta read → ReportResult → artifact → notification.send → provider`. Builders de relatório não conhecem tokens de notification nem decidem o canal.
