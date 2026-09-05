# Compatibilidade de Runtimes

## Matriz

| Componente | Claude Code | Hermes | Codex | Estratégia |
|---|---|---|---|---|
| Contexto | Nativo em `CLAUDE.md` | Precisa de `HERMES.md` explícito | Nativo em `AGENTS.md` | Contexto curto por runtime, políticas neutras em `core/` |
| Commands | `.claude/commands/` e slash commands | Skills/wrappers | Roteiros lidos manualmente | Workflow ID central, wrapper por runtime |
| Skills | Diretório `.claude/skills/` | Diretório externo inicialmente | Referência manual | Não mover ainda; registrar diretório externo Hermes |
| Agentes | `Agent`/`Task` | main agent/delegates | Papéis no agente atual | Mapear interação versus delegate |
| Hooks | `settings.json` | Não portáveis diretamente | Não executados automaticamente | Política local, sem rede, não como dependência do core |
| Scheduling | `/schedule` | cron Hermes | sem scheduler próprio | `core/scheduling` + adapters Claude/Hermes/cron/n8n |
| Memória | agents-memory e produto | memória Hermes + disco | produto/disco e contexto da sessão | negócio em `meus-produtos`; preferências no runtime |
| MCP | Claude/MCP e conectores | MCP Hermes | ferramentas/conectores disponíveis | interfaces de integração sem namespace no core |
| Scripts | via Bash com permissões Claude | processo da VPS | terminal sujeito a aprovação | adapters executam somente scripts permitidos |
| Aprovação | diálogo/preview no fluxo | gateway + estado | confirmação explícita | `core/approvals`, persistente e independente |

## Regras de portabilidade

- Markdown metodológico, templates e estado do produto são portáveis e devem ser a prioridade.
- Claude continua sendo compatível durante a migração. `.claude/` não será removido nesta etapa.
- Hermes é o destino de operação contínua, mas nenhum comportamento Hermes é assumido sem configuração/documentação validada pelo operador.
- Codex permanece executor de engenharia e deve ler os roteiros atuais até os adapters existirem.
- Nenhum runtime pode expor segredo. Ações passam por uma `ApprovalPolicy` persistida, com default seguro e trilha de auditoria.

## Política de aprovação

Há dois modelos. `APPROVAL_PER_ACTION` corresponde a `mode: manual` e é obrigatório para ativar campanha Meta, aumentar orçamento, escalar investimento, deletar conteúdo, modificar recursos externos sensíveis e qualquer operação irreversível ou financeira.

`STANDING_APPROVAL` corresponde a `mode: standing`. O usuário pode configurá-lo explicitamente para workflow recorrente e de escopo limitado, por exemplo: enviar relatório diário ao próprio Telegram, atualizar dashboard toda manhã, gerar pesquisa semanal, publicar conteúdo orgânico de uma fila previamente aprovada ou publicar no horário programado quando `autopublish` estiver habilitado para aquele workflow.

```text
ApprovalPolicy

mode:
  manual
  standing
  disabled

scope:
  workflow
  network
  action_type
  product

expires_at:
limits:
revocable:
```

Uma standing approval registra `workflow_id`, escopo, redes permitidas, tipos de conteúdo, horário/frequência, validade, limites, quem autorizou e como pode ser revogada. `disabled` significa que a ação não está autorizada, não “sem aprovação”. O padrão é `autopublish = false`; `autopublish = true` exige configuração explícita para aquele workflow. Operações financeiras permanecem `manual` por padrão.

## Compatibilidade por classe

| Classe | Situação | Ação posterior |
|---|---|---|
| Inteligência VTSD, copy e revisão | Amplamente portátil, em Markdown. | Extrair por cópia controlada/referência após testes. |
| Orquestradores interativos | Dependem do diálogo do runtime. | Manter no agente principal de cada runtime. |
| Pesquisa, revisão e geração auxiliar | Candidatos a trabalho isolado. | Hermes delegates; no Codex, execução contextual. |
| Meta/Imagem/Vídeo | Dependem de provider, segredo e custo. | Interfaces com dry-run e aprovação. |
| Hooks/GSD/statusline | Específicos do Claude. | Tratar como compatibilidade, não como core. |
| Electron/instaladores | Não são requisito do core e hoje têm lacunas. | Isolar como distribuição opcional. |
