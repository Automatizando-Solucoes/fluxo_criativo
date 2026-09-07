# Codex runtime

`AGENTS.md` é o entrypoint Codex. `agents/` contém metodologia e políticas neutras. `core/` contém contratos de negócio. `adapters/codex/` é somente glue para resolver e testar esses contratos.

Codex não executa command Claude diretamente nem ativa providers, cron, delegate, gateway ou secrets reais.
