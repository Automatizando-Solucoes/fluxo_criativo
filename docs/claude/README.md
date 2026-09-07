# Runtime Claude

Claude Code é o runtime funcional de referência. O estado de negócio está em `meus-produtos/{slug}/`; o core registry descreve intenções canônicas, sem substituir os commands e skills compatíveis.

1Password é a fonte de segredo. Commands conhecem somente nomes lógicos; `SecretProvider` e runtime injection isolam valores. `ApprovalPolicy` protege side effects: manual, standing ou disabled.

`READY_EXTERNAL` significa que o contrato canônico, os gates de segurança e o mock/dry-run estão concluídos; não significa que um provider live já tenha sido validado.

Meta usa `META_ACCESS_TOKEN` no transport APP e OAuth separado no `MCP_CONECTOR`; campanhas novas são sempre `PAUSED`. WhatsApp canônico é UAZAPI e Telegram é delivery opcional, ambos dry-run nesta fase. Publisher inicia com `autopublish:false`.

C10X/`ht-*` permanece `BLOCKED_EXTERNAL`. O adapter Hermes foi preservado e está congelado enquanto Claude é finalizado. Consulte [WORKFLOW-STATUS.md](WORKFLOW-STATUS.md) para o estado funcional e testes correspondentes.
