# Adapter futuro do 1Password

Este diretório reserva a implementação do adapter `1PasswordSecretProvider`. A Fase I não executa `op`, não lê vaults e não recebe `OP_SERVICE_ACCOUNT_TOKEN`.

O adapter futuro deverá preservar o contrato em `core/secrets/`: verificar disponibilidade, retornar somente referência `op://` e executar apenas operações allowlisted com injeção de runtime. Ele nunca deverá fornecer plaintext ao LLM ou implementar `get_secret`.
