# Migração de secrets Meta

| Arquivo | Uso | Secret/config | Classificação | Ação |
| --- | --- | --- | --- | --- |
| `trafego-conexao.md` | conexão canônica | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | CANONICAL_SAFE | descriptors dry-run e 1Password |
| `gerar-token-permanente-facebook-ads.md` | provisionamento humano | `META_ACCESS_TOKEN` | CANONICAL_SAFE | UI Meta → 1Password |
| `gerar-token-facebook-ads.md`, `meta-conexao.md` | aliases de compatibilidade | nenhum | LEGACY_ALIAS | redirecionam para o command canônico |
| `criar-aplicativo-analise-ads.md` | preparação humana do App Meta | nenhum | CANONICAL_SAFE | sem token, `.env` ou chamada pelo projeto |
| `obter-id-conta-anuncios.md` | seleção de conta | `META_AD_ACCOUNT_ID` | CANONICAL_SAFE | persiste somente configuração não secreta |
| `trafego-insights.md` | leitura canônica | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | CANONICAL_SAFE | `ads.insights` dry-run via adapter |
| `trafego-analise.md` | análise canônica | dados normalizados | CANONICAL_SAFE | aquisição separada de análise |
| `trafego-criar-campanha.md` | criação canônica | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | CANONICAL_SAFE | `ads.campaign.create`, manual e `PAUSED` |
| `trafego-otimizar.md` | diagnóstico e mudança tipada | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | CANONICAL_SAFE | `ads.insights` ou `ads.optimize`, sem autorização implícita |
| `trafego-escalar.md` | escala canônica | `META_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID` | CANONICAL_SAFE | `ads.scale`, `FINANCIAL_WRITE`, grant manual |
| skills `trafego-insights`, `trafego-analise`, `trafego-criar-campanha`, `trafego-otimizar`, `trafego-escalar` | metodologia e runtime histórico | aliases/.env/curl | LEGACY_FLOW | `LEGACY_META_RUNTIME`; não invocáveis nem autoridade operacional |
| skill `trafego-pago` | metodologia geral | sem credencial Meta | CANONICAL_SAFE | conhecimento reutilizável, sem runtime de provider |
| `scripts/relatorio-ads-cli.py` | builder canônico | `META_ACCESS_TOKEN` runtime injected | CANONICAL_SAFE | não conhece delivery |
| `scripts/relatorio-ads.ps1` | builder legado | aliases Meta | LEGACY_FLOW | sem delivery; Python é preferido |

Aliases `FB_ACCESS_TOKEN_PERMANENTE`, `FB_ACCESS_TOKEN_TEMPORARIO`, `ACCESS_TOKEN`, `FB_AD_ACCOUNT_ID` e `AD_ACCOUNT_ID` são somente `LEGACY_ALIAS`. `META_AUTH_MODO` é a configuração não secreta de compatibilidade (`MCP_CONECTOR` ou `APP`); no primeiro caso o OAuth pertence ao conector e, no segundo, o adapter requer apenas o nome lógico `META_ACCESS_TOKEN`. `RELATORIO_AUTH_MODO` é `LEGACY_CONFIG` após o desacoplamento do report builder.

## Operações canônicas

`meta.auth.validate`, `meta.accounts.list`, `ads.insights`, `ads.campaign.create`, `ads.campaign.update_status`, `ads.optimize` e `ads.scale` são allowlisted em `adapters/claude/meta-ads.js`. Todas produzem descriptors `dry_run`; nenhuma expõe segredo. `ads.scale` é `FINANCIAL_WRITE` e requer grant manual da ação exata.
