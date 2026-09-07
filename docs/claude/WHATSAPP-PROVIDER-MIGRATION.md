# Migração do provider WhatsApp

| Arquivo | Referência atual | Uso | Status | Ação |
| --- | --- | --- | --- | --- |
| `.claude/commands/ads-relatorio.md` | UAZAPI | descriptor de entrega | CANONICAL_MIGRATE | usar `notification.send` dry-run |
| `.claude/commands/enviar-relatorio-ads.md` | Z-API | envio legado acoplado | LEGACY_KEEP | não usar como caminho canônico; migrar para adapter UAZAPI |
| `.claude/commands/configurar-zapi.md` | Z-API | configurador histórico | LEGACY_KEEP | aviso de provider legado |
| `scripts/relatorio-ads-cli.py` | Z-API | envio legado acoplado ao relatório | LEGACY_KEEP | separar builder de report e provider em fase posterior |
| `scripts/relatorio-ads.ps1` | Z-API | envio legado PowerShell | LEGACY_KEEP | não usar no runtime canônico |
| `.env.op.example` | UAZAPI | referência de secret | CANONICAL_MIGRATE | `UAZAPI_TOKEN=op://...` |

UAZAPI usa `UAZAPI_BASE_URL` como configuração não secreta, `UAZAPI_TOKEN` como segredo 1Password e `RELATORIO_WHATSAPP_NUMERO` sem pontuação. O adapter canônico descreve `POST /send/text`; requisições e status de instância são futuros, dry-run nesta fase.
