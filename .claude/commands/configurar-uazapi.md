---
name: workshop-marketing:configurar-uazapi
description: Orienta a configuração não conversacional de UAZAPI via 1Password.
allowed-tools: Read
---

# Configurar UAZAPI

Configure `UAZAPI_BASE_URL` como valor não secreto e `RELATORIO_WHATSAPP_NUMERO` em formato internacional sem sinais. Provisionar `UAZAPI_TOKEN` diretamente no 1Password como referência `op://` dentro de `.env.op`; nunca cole o token no chat, `.env` ou terminal. O runtime futuro só verifica disponibilidade lógica com `SecretProvider`; não use `op read`, QR code ou chamada de conexão neste command.
