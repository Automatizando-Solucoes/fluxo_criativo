---
name: workshop-marketing:enviar-relatorio-ads
description: Prepara a entrega aprovada de um relatório Ads sem acoplar dados Meta ao provider de notificação.
allowed-tools: Read
---

# Entregar relatório Ads

Orquestre responsabilidades separadas:

1. obtenha ou gere um `ReportResult` por `/ads-relatorio`;
2. confirme que `ReportResult.delivery` ainda é `null`;
3. escolha o canal não secreto `RELATORIO_CANAL` (`TELEGRAM` ou `WHATSAPP`);
4. crie um descriptor `notification.send` separado;
5. aplique ApprovalPolicy quando o escopo do envio exigir;
6. delegue a entrega futura ao adapter de notification.

WhatsApp usa provider `uazapi`, `UAZAPI_BASE_URL` e `RELATORIO_WHATSAPP_NUMERO` como configuração não secreta, com `UAZAPI_TOKEN` apenas como requisito lógico. Telegram usa provider `telegram`, `TELEGRAM_CHAT_ID` como configuração não secreta e `TELEGRAM_BOT_TOKEN` apenas como requisito lógico.

Nesta fase, o resultado de delivery é sempre `sent: false` e `dry_run: true`. Não leia `.env`, não use aliases Meta, não monte requisições para provider, não acesse segredo e não envie mensagens. Z-API é `LEGACY / NOT USED` e não participa deste fluxo.
