# Adapter Hermes

Na L1, o resolver aceita seis intenções canônicas que possuem wrappers em `skills/`: `research.market`, `copy.page`, `copy.ad`, `copy.social`, `creative.static` e `ads.insights`. `traffic.insights` é alias de compatibilidade que resolve explicitamente para `ads.insights` e para o mesmo wrapper, sem segunda implementação. Todo descriptor permanece `executable: false` e `mode: dry_run`. Não chama Hermes, commands Claude ou integrações.

Workflows sem wrapper falham explicitamente. Em particular, `toolkit.execute` continua bloqueado até que o runtime futuro resolva riscos dos filhos e seus gates.
