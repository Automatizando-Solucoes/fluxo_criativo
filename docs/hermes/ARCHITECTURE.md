# Arquitetura Hermes em dry-run

```text
core workflow registry
        ↓
Hermes resolver
        ↓
wrapper conhecido
        ↓
estado local em meus-produtos
```

Wrappers consultam fontes Claude por referência, sem copiar a inteligência. Capacidades externas, cron, delegates, gateway e injeção de segredos ficam atrás de contratos próprios e não são executados nesta fase.
