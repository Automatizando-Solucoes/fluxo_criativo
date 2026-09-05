# 1Password como Secret Provider

## Arquitetura

O core futuro usa o contrato conceitual `SecretProvider -> 1PasswordSecretProvider`. Ele expõe `has_secret(name)`, `secret_reference(name)` e `run_with_secrets(command, required_secrets)`. Não existe `get_secret(name)` que devolva plaintext ao modelo.

Referências seguem `op://<vault>/<item>/<field>`. O modelo pode conhecer a referência, variável e status de disponibilidade, mas não lê valores.

## Catálogo de variáveis

| Env | Classe | Fonte | Observação |
|---|---|---|---|
| `OPENROUTER_API_KEY`, `HEYGEN_API_KEY`, `REPLICATE_API_TOKEN`, `APIFY_API_TOKEN`, `FREEPIK_API_KEY`, `GEMINI_API_KEY` | SECRET | 1Password | Referência própria por provider. |
| `VERCEL_TOKEN`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `HOTMART_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `TELEGRAM_BOT_TOKEN` | SECRET | 1Password | Referência própria por integração. |
| `META_ACCESS_TOKEN` | SECRET | 1Password | Variável canônica da credencial Meta. |
| `FB_ACCESS_TOKEN_PERMANENTE`, `FB_ACCESS_TOKEN_TEMPORARIO`, `ACCESS_TOKEN` | LEGACY_ALIAS | Referência canônica Meta | Usam temporariamente a mesma referência de `META_ACCESS_TOKEN`; adapter futuro deve mapear a variável canônica para aliases legados. |
| `META_PIXEL_CAPI_TOKEN`, `META_PIXEL_TEST_EVENT_CODE` | SECRET | 1Password | Segredos específicos da integração Pixel/CAPI. |
| `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN` | SECRET | 1Password | Credenciais distintas da Z-API. |
| `META_AD_ACCOUNT_ID`, `META_PIXEL_ID`, `GOOGLE_ADS_CUSTOMER_ID`, `HOTMART_PRODUCT_ID` | NON_SECRET_CONFIG | Configuração comum | Identificadores de conta, produto ou recurso. |
| `WHATSAPP_PHONE_ID`, `TELEGRAM_CHAT_ID`, `FB_AD_ACCOUNT_ID`, `ZAPI_INSTANCE_ID`, `VERCEL_PROJECT_ID` | NON_SECRET_CONFIG | Configuração comum | IDs operacionais, sem vault obrigatório. |
| `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID`, `RELATORIO_CANAL`, `RELATORIO_WHATSAPP_NUMERO`, `RELATORIO_CRON_ID` | NON_SECRET_CONFIG | Configuração comum | Seleção, destino ou estado operacional. |
| `AD_ACCOUNT_ID` | LEGACY_ALIAS | `META_AD_ACCOUNT_ID` | Não é segredo; adapter futuro deve mapear a configuração canônica. |
| `OPENROUTER_IMAGE_MODEL`, `OPENROUTER_MODEL` | NON_SECRET_CONFIG | Configuração comum | Seleção de modelo, não credencial. |

## Injeção em runtime

`.env.op` local contém somente referências e é ignorado pelo Git. Use o modelo:

```bash
op run --env-file=.env.op -- <processo>
```

Scripts continuam consumindo variáveis de ambiente existentes. A injeção ocorre apenas no processo filho. Uma verificação permitida produz somente sucesso ou falha, por exemplo `test -n "$REPLICATE_API_TOKEN"`; nunca imprima variável.

## Hermes e VPS

Para execução unattended, use uma Service Account dedicada ao Fluxo Criativo, com acesso apenas aos vaults necessários, menor privilégio e read-only quando o processo apenas consome segredo. Habilite Activity Log, rotação e revogação centralizada. `OP_SERVICE_ACCOUNT_TOKEN` é bootstrap do host/runtime: nunca entra em repositório, `.env.op`, chat ou documentação como valor. Seu provisionamento não é implementado nesta fase.

## Rotação e auditoria

Rotacione no 1Password, mantenha referências estáveis quando possível e revogue acesso da Service Account quando necessário. Investigue uso por Activity Log. Toda integração externa continua sujeita a approval gates e não deve revelar material de autenticação ao LLM.
