# Auditoria de migração metodológica

Os documentos legados são snapshots históricos, não fontes canônicas. A fonte
ativa de cada domínio está em `agents/` e é enumerada no manifest.

| Legado | SAFE_METHODOLOGY migrada | Runtime/provider/segredo mantido no legado | Compatibilidade |
| --- | --- | --- | --- |
| pesquisa-mercado | acionamento, entradas, nove eixos, concorrência, preços, Top 10, anúncios, riscos, fontes e fallback | coleta e ferramentas específicas | snapshot histórico |
| trafego-insights | janelas, atribuição, métricas, denominadores, cache, breakdowns, falha parcial e output | transporte Meta, acesso de conta e runtime | snapshot histórico |
| trafego-analise e sub-skills | dez recortes diagnósticos, score, hipóteses, comparativos e projeção | scripts, aliases e automação antiga | snapshot histórico |
| trafego-criar-campanha | objetivo, estrutura, público, criativos, tracking, preview, validação e PAUSED | leitura/provider e execução de campanha | snapshot histórico |
| trafego-otimizar | trilhas, critérios de corte, revalidação, lote e handoff financeiro | alterações diretas e runtime | snapshot histórico |
| trafego-escalar | modos, CBO/Advantage, velocidade, prontidão, freios, tetos e gate financeiro | execução de budget/provider | snapshot histórico |
| paginas | 8D, seleção de seções, design, assets e checklist | ferramentas de geração e deploy | snapshot histórico |
| carrossel | estilos, progressão, prompts, lote, revisão e não publicação | ferramentas e agendamento operacional | snapshot histórico |
| dashboard-social | normalização, interpretação, cache e preservação em falha | scripts, configuração e aquisição | snapshot histórico |

Classificação: decisões, fórmulas, critérios, templates e exemplos são
`SAFE_METHODOLOGY`; comandos, scripts e roteamento são `RUNTIME_SPECIFIC`;
integrações são `PROVIDER_SPECIFIC`; credenciais e ambiente são
`SECRET_HANDLING`; ponteiros antigos são `LEGACY_COMPATIBILITY`.
