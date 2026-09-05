# Changelog da Sanitização

Este registro descreve mudanças da Fase H. Cada lote é isolado em seu próprio commit e validado sem rede, credenciais, APIs, instaladores ou deploy.

## Lote 1: instalação automática em SessionStart

- Commit: `security: remove automatic runtime installation hook`
- Arquivos: `.claude/hooks/setup-node.sh` (removido), `.claude/settings.json`, este changelog.
- Antes: SessionStart podia instalar Node, Homebrew, nvm, pacotes apt ou winget, incluindo `curl | bash` e `sudo`.
- Depois: nenhum SessionStart instala software. Os requisitos permanecem passivos: cada runtime/ferramenta opcional deve ser instalado e configurado pelo operador antes de usar o recurso que o exige.
- Risco mitigado: instalação automática, elevação de privilégio e execução remota no início da sessão.
- Possível regressão: ambientes sem Node não executam hooks legados que dependem dele; nenhum fluxo de negócio depende do hook removido.
- Validação: busca estática de referências a `setup-node.sh`, revisão da configuração SessionStart e `git diff --check`.

## Lote 2: permissões do runtime Claude

- Commit: `security: tighten Claude runtime permissions`
- Arquivos: `.claude/settings.json`, este changelog.
- Antes: a allow-list autoaprovava `Bash(ls *)`, `Bash(vercel *)` e `Bash(python3)`, incluindo deploy e execução arbitrária por interpretador.
- Depois: mantém leitura delimitada do projeto, `WebSearch(*)` e `WebFetch(*)` para pesquisa funcional. Remove toda autoaprovação de Bash, deploy e comandos externos; esses side effects exigem autorização explícita do runtime e os gates do fluxo.
- Risco mitigado: execução automática de comandos, deploy não confirmado e uso de interpretador fora do escopo.
- Possível regressão: scripts locais que antes não pediam autorização agora exigem confirmação explícita, sem remoção do script ou da capacidade funcional.
- Validação: revisão estática da allow-list, confirmação da manutenção de `WebSearch`/`WebFetch` e `git diff --check`.
