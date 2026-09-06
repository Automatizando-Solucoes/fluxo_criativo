# Adapter Hermes

O resolver aceita somente os seis workflows que possuem wrappers em `skills/`. Ele retorna um descriptor `hermes.skill`, sempre com `executable: false` e `mode: dry_run` nesta fase. Não chama Hermes, commands Claude ou integrações.

Workflows sem wrapper falham explicitamente. Em particular, `toolkit.execute` continua bloqueado até que o runtime futuro resolva riscos dos filhos e seus gates.
