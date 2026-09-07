---
name: workshop-marketing:enviar-relatorio-ads
description: Busca as métricas do Facebook Ads e envia o relatório pelo Telegram ou WhatsApp. Detecta automaticamente o modo configurado (CLI Python ou Manual PowerShell).
allowed-tools: Read, Bash
model: sonnet
user-invocable: false
---

# Enviar Relatorio de Ads

Executa imediatamente: busca as metricas do Facebook Ads do periodo escolhido e envia no canal configurado (Telegram ou WhatsApp). Sem agendamento.

Detecta `RELATORIO_AUTH_MODO` no `.env` e usa o script correto:
- `CLI`: `scripts/relatorio-ads-cli.py` (Python, cross-platform)
- `MANUAL` ou nao definido: `scripts/relatorio-ads.ps1` (PowerShell, Windows)

## PASSO 0. Verificar modo de conexão Meta

Antes de qualquer coisa, leia `META_AUTH_MODO` no `.env` para decidir o caminho.

- **Vazia ou ausente:** chame a skill `/trafego-conexao` para o aluno escolher o modo. Quando ela terminar e gravar `META_AUTH_MODO`, retorne aqui.
- **`META_AUTH_MODO=MCP_CONECTOR`:** o Passo 1.1 (credenciais Facebook) é pulado por completo. A conexão Meta foi validada via conector personalizado em `/trafego-conexao` e não usa token no `.env`. Vá direto para o Passo 1.2 (canal de envio).
- **`META_AUTH_MODO=APP`:** executar normalmente o Passo 1.1 e o Passo 1.2.

> **Nota sobre as duas variáveis.** `META_AUTH_MODO` decide o caminho de autenticação com o Meta (MCP via Claude ou Token via App no `.env`). `RELATORIO_AUTH_MODO` decide o executor do relatório dentro do ramo App (Python CLI cross-platform ou PowerShell Windows). Não são redundantes, atuam em camadas diferentes.

---

## PASSO 1. Verificar credenciais

### 1.1 Credenciais Facebook (apenas modo APP)

> Pular este sub-passo completo se `META_AUTH_MODO=MCP_CONECTOR`. No modo MCP não há token Facebook no `.env`.

Leia `.env`.

**Detectar o sub-modo de execução:**

Se `RELATORIO_AUTH_MODO=CLI` (ou nao definido mas `ACCESS_TOKEN` existir):
- Verificar `ACCESS_TOKEN` (ou fallback `FB_ACCESS_TOKEN_PERMANENTE` / `FB_ACCESS_TOKEN_TEMPORARIO`)
- Verificar `AD_ACCOUNT_ID` (ou fallback `FB_AD_ACCOUNT_ID`)
- Se faltar: oriente a rodar `/ads-relatorio` primeiro para configurar o modo CLI.

Se `RELATORIO_AUTH_MODO=MANUAL` (ou nao definido e `ACCESS_TOKEN` nao existir):
- Verificar pelo menos uma das variaveis: `FB_ACCESS_TOKEN_PERMANENTE` ou `FB_ACCESS_TOKEN_TEMPORARIO`
- Verificar `FB_AD_ACCOUNT_ID`
- Se faltar token: pergunte se tem App no Facebook Developers
  - Se sim: execute a skill `gerar-token-permanente-facebook-ads`
  - Se nao: execute a skill `criar-aplicativo-analise-ads`, depois `gerar-token-permanente-facebook-ads`
- Se faltar `FB_AD_ACCOUNT_ID`: execute a skill `obter-id-conta-anuncios`

### 1.2 Canal de envio (sempre, independente do modo)
- Se `RELATORIO_CANAL` nao existir no `.env`, pergunte:

```
Por qual canal quer enviar o relatorio?

1. Telegram (Recomendado)
2. WhatsApp

Digite o numero:
```

Se o usuario perguntar por que Telegram e recomendado: "O Telegram e gratuito e nao tem risco de bloqueio. Automacoes no WhatsApp podem banir o numero."

Se WhatsApp, exiba antes de continuar: "Atencao: use um numero secundario aquecido, nao o numero principal da operacao."

Registre apenas a preferência não secreta de canal na configuração local apropriada; nunca escreva segredo em `.env`.

**Se `RELATORIO_CANAL=TELEGRAM`:**
- Verificar `TELEGRAM_CHAT_ID` e disponibilidade lógica de `TELEGRAM_BOT_TOKEN` pelo SecretProvider.

**Se `RELATORIO_CANAL=WHATSAPP`:**
- Verificar `UAZAPI_BASE_URL`, `RELATORIO_WHATSAPP_NUMERO` e disponibilidade lógica de `UAZAPI_TOKEN` pelo SecretProvider.
- Se faltar token, orientar provisionamento direto no 1Password; nunca solicitar o valor.
- Se faltar `RELATORIO_WHATSAPP_NUMERO`:

```
Para qual numero do WhatsApp devo enviar o relatorio?

Digite no formato internacional sem + e sem espacos.
(ex: 5511999887766)
```

Salve como `RELATORIO_WHATSAPP_NUMERO=valor` no `.env`.

**Quando todas as credenciais estiverem presentes:** avance para o Passo 2.

## PASSO 2. Perguntar o periodo

Pergunte ao usuario:

```
Qual periodo voce quer no relatorio?

1. Ontem
2. Ultimos 7 dias
3. Ultimos 30 dias
4. Periodo personalizado (informar data inicial e final)

Digite o numero:
```

- Opcao 1: calcule `INICIO_ISO` e `FIM_ISO` como ontem. Label do periodo: `{ONTEM_BR}`.
- Opcao 2: `INICIO_ISO` = hoje menos 7 dias, `FIM_ISO` = ontem. Label: `Ultimos 7 dias`.
- Opcao 3: `INICIO_ISO` = hoje menos 30 dias, `FIM_ISO` = ontem. Label: `Ultimos 30 dias`.
- Opcao 4: peca a data inicial (formato DD/MM/AAAA) e a data final (formato DD/MM/AAAA), converta para ISO (AAAA-MM-DD). Label: `{INICIO_BR} a {FIM_BR}`.

Para calcular as datas use Bash:
```bash
# Ontem
date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d
# 7 dias atras
date -d "7 days ago" +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d
# 30 dias atras
date -d "30 days ago" +%Y-%m-%d 2>/dev/null || date -v-30d +%Y-%m-%d
```

Guarde `INICIO_ISO`, `FIM_ISO` e `LABEL_PERIODO`.

## PASSO 3. Executar busca de dados

A busca varia conforme `META_AUTH_MODO`.

### Se `META_AUTH_MODO=MCP_CONECTOR` (modo MCP)

Identifique no namespace MCP a tool de insights da Meta exposta pelo conector personalizado adicionado no `/trafego-conexao`. O nome exato depende do nome que o aluno deu ao conector. Estratégia:

1. Listar tools com prefixo `mcp__*` cujo sufixo trate de insights/performance (ex: `mcp__Meta_Ads__ads_insights_advertiser_context`, `mcp__Meta_Ads__ads_insights_performance_trend`).
2. Se a busca não for conclusiva, perguntar ao aluno o nome que ele deu ao MCP.

Chame a tool de insights passando o intervalo de datas (`INICIO_ISO` a `FIM_ISO`) e os campos de métrica relevantes (gasto, alcance, impressões, cliques, CTR, CPM, CPC, ações de purchase/lead). O conector é responsável por decidir qual conta de anúncios usar (definido no OAuth feito em `/trafego-conexao`).

Guarde o JSON retornado na variável `data` para o Passo 4 montar a mensagem.

> **Nota.** O modo MCP busca os dados, mas não envia mensagem. O envio (Telegram ou Z-API) é feito separadamente no Passo 6.

### Se `META_AUTH_MODO=APP` (modo App via Facebook Developers)

Use o script adequado ao sub-modo configurado em `RELATORIO_AUTH_MODO`. Ambos os scripts lêem o `.env`, mascaram segredos nos logs e já retornam os dados formatados E enviam pelo canal configurado de uma vez só.

**Se `RELATORIO_AUTH_MODO=CLI`:**

Determine o comando Python correto primeiro:
```bash
python --version 2>&1 || python3 --version 2>&1
```

Depois execute (substitua `python` por `python3` se necessario):
```bash
python scripts/relatorio-ads-cli.py {ESCOLHA_PERIODO} {INICIO_BR} {FIM_BR}
```

Onde `{ESCOLHA_PERIODO}` e o numero escolhido no Passo 2 (1, 2, 3 ou 4). Para opcao 4, passe tambem inicio e fim no formato DD/MM/AAAA. Exemplos:
- Ontem: `python scripts/relatorio-ads-cli.py 1`
- Ultimos 7 dias: `python scripts/relatorio-ads-cli.py 2`
- Personalizado: `python scripts/relatorio-ads-cli.py 4 01/04/2026 30/04/2026`

**Se `RELATORIO_AUTH_MODO=MANUAL` (ou nao definido):**
```bash
powershell.exe -ExecutionPolicy Bypass -File "scripts/relatorio-ads.ps1"
```

Nunca passe segredo pela URL, chat ou comando. A aquisição Meta e delivery são boundaries separados por SecretProvider.

> **Nota.** Scripts canônicos apenas constroem o relatório; delivery é adapter separado.

## PASSO 4. Montar a mensagem

Se `data` vier vazio (`[]`):

```
*Relatorio Meta Ads - {LABEL_PERIODO}*

Sem dados para o periodo. Verifique se ha campanhas ativas.
```

Se `data` tiver conteudo, monte:

```
*Relatorio Meta Ads - {LABEL_PERIODO}*

*Investimento e Alcance*
Gasto: R$ X,XX
Alcance: X.XXX
Impressoes: X.XXX

*Engajamento*
Cliques: X.XXX
CTR: X,XX%
CPM: R$ X,XX
CPC: R$ X,XX
```

Se houver `actions` com `action_type` igual a `purchase` ou `lead`, adicione:

```
*Conversoes*
Resultados: X
Custo por resultado: R$ X,XX
```

Formatacao numerica: valores monetarios com virgula decimal e ponto milhar (ex: `R$ 1.234,56`). Percentuais com virgula (ex: `3,42%`).

## PASSO 5. Criar descriptor de delivery

**Se Telegram:**

```
Relatorio pronto. O delivery Telegram será representado por `notification.send` com provider `telegram` e descriptor dry-run.
```

**Se WhatsApp:**

```
Relatorio pronto. O delivery WhatsApp será representado por `notification.send` com provider `uazapi`, `UAZAPI_BASE_URL` e número mascarado.
```

Os dois modos Meta, APP e MCP_CONECTOR, produzem o mesmo artefato de relatório. Nesta fase o command cria somente descriptor com `sent:false` e `dry_run:true`; não lê segredos, não usa curl e não envia mensagens. O runtime futuro delegará para o adapter de notification autorizado.
