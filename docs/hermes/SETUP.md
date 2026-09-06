# Preparação do Hermes

Nesta fase, o operador instala e configura Hermes separadamente, seguindo procedimento oficial manual. Este repositório não instala software, não usa `curl | bash` e não inicia processo Hermes.

Configure o working directory como a raiz do projeto para que `HERMES.md`, `core/` e `adapters/hermes/skills/` sejam visíveis. Wrappers Hermes são fontes controladas; diretórios externos de skills só poderão ser configurados depois da allowlist em `SKILL-COMPATIBILITY.md` e de validação do operador.

Uma Service Account 1Password para VPS é futura e deve ser provisionada diretamente no host. Nenhum token deve ser colocado no repositório, `.env.op` ou chat.
