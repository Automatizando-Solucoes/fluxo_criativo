# High Ticket e C10X

O orquestrador `estrategista-ht` é preservado. As skills operacionais `ht-*` do C10X não existem neste repositório e não devem ser aproximadas por metodologia genérica.

`adapters/claude/high-ticket-status.js` verifica a disponibilidade antes de qualquer roteamento. Enquanto as dependências estiverem ausentes, retorna `BLOCKED_EXTERNAL`, lista as skills faltantes, informa os artefatos já existentes em `entregas/ht/` e explica a retomada. Não altera nem remove dados do produto.
