# Gateway Hermes descriptors

O adapter representa `approval.request`, `workflow.completed`, `workflow.failed` e `report.ready` para destinos futuros Telegram, WhatsApp, Slack ou Discord. Ele apenas formata descriptor `dry_run`; não conecta canal, não lê token e não envia mensagem.

O gateway Hermes é um canal de conversa ou entrega do agente. Ele não substitui a capability de negócio `notification.send`: quando um workflow precisar enviar WhatsApp, o provider canônico continua UAZAPI por meio do adapter de integração e de seus gates próprios.
