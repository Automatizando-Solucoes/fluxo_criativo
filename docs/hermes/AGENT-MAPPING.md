# Mapa de agentes Hermes

O mapa é declarativo. Nenhum agente foi convertido em delegate real nesta fase e os arquivos em `.claude/agents/` continuam fontes de compatibilidade.

## INTERACTIVE_MAIN

`estrategista-de-produto`, `estrategista-low-ticket`, `estrategista-middle-ticket`, `estrategista-ht`, `executor-de-plano-de-acao`, `copywriter`, `construtor-de-paginas`, `criador-de-campanhas`, `consultor-comercial` e `video-maker` permanecem no agente principal porque fazem entrevista, decidem com o usuário ou orquestram sequência.

`estrategista-ht` é preservado como orquestrador; a dependência externa `ht-*` continua ausente e não será inventada.

## DELEGATE

`pesquisa-mercado`, `revisor-pesquisa`, `revisor-perfil`, `revisor-idconsumidor`, `gerador-decorados`, `gerador-urgencias-ocultas` e `gerador-idconsumidor` são candidatos a delegate isolado. Todos ficam `enabled: false` até o contrato de delegação e gates futuros.

## DEFERRED

`clonador-de-bloco-visual` não recebe delegate nesta fase: pode modificar arquivo ou depender de provider. Ele requer contrato específico de filesystem/provider antes de ser habilitado.
