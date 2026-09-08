# Política de fontes runtime-neutral

## Permitido reutilizar

Metodologia, frameworks, critérios, templates, fórmulas, raciocínio de marketing, regras de revisão e semântica de negócio.

## Ignorar ou substituir

Instruções específicas de runtime, chamadas `Skill`, `Agent` ou `Task`, shell, instalação, chamadas diretas de provider, segredos, publicação, deploy, execução de cron e execução de delegate.

Operations IDs do `core/` são permitidos como fronteiras tipadas. A execução real continua sendo responsabilidade de adapter autorizado e das políticas do core.
