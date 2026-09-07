# Adapter Hermes

Após L2, o resolver aceita wrappers locais testados para produto, copy, funis, página, carrossel e comercial. Essas operações usam `core/local/workflows.js`, não importam adapters Claude e escrevem somente no estado do produto. Low/Middle Ticket são `local_with_external_dry_run`: geram plano local, mas seu handoff Meta não é executável. Pesquisa, criativo estático e insights permanecem dry-run. `traffic.insights` é alias de compatibilidade que resolve explicitamente para `ads.insights` e para o mesmo wrapper, sem segunda implementação.

Workflows sem wrapper falham explicitamente. `plan.execute` e `toolkit.execute` resolvem riscos, approval, dependências e estado local dos filhos, mas não fazem dispatch automático. `carousel.schedule` persiste somente descriptor local com `scheduled:false`. `executable:true` significa somente que há implementação local Hermes testada, nunca provider, cron, delegate ou integração live.
