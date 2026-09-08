---
name: trafego-criar-campanha
description: Metodologia neutra para planejar campanhas de Meta Ads.
---

# Criação de campanha

## Método

Planeje objetivo, evento de conversão, estrutura de campanha e conjuntos,
público, posicionamentos, criativos, orçamento, nomenclatura, rastreamento e
preview. Distingua Sales de Leads e valide coerência entre oferta, funil,
pixel, conversão e criativo antes do handoff.

Liste as leituras necessárias de conta, pixels, conversões, audiências,
interesses e criativos como necessidades de negócio, não como chamadas de
provider.

## Boundary canônico

Leituras usam operações Meta allowlisted. A criação é exclusivamente
`ads.campaign.create`: `WRITE`, approval manual por `action_id` e draft sempre
`PAUSED`. Pedido de `ACTIVE` não altera essa regra. A skill não escolhe
transport, não acessa segredo e não executa criação.

## Coleta e estrutura

Comece declarando o resultado comercial: venda, lead qualificado ou etapa de
aprendizado. Para Sales, escolha o evento que representa valor real e só use
eventos superiores quando pixel, volume e atribuição os sustentarem. Para
Leads, defina qualificação, destino e prazo de contato antes de aumentar
volume.

Monte a campanha em campanha, conjunto e anúncio. Cada nível deve ter uma
hipótese única: objetivo no nível de campanha, público/otimização/
posicionamento no conjunto e ângulo/criativo/copy no anúncio. Não misture
várias hipóteses no mesmo teste.

## Públicos, criativos e tracking

Use públicos amplos, interesses, remarketing e semelhantes como hipóteses
comparáveis, não como garantia de resultado. Registre exclusões, geografia,
idade, idioma e tamanho estimado. Só proponha semelhante quando existir fonte
de qualidade e volume suficiente; só proponha remarketing quando a janela e a
origem forem claras.

O criativo precisa carregar gancho, mecanismo, prova compatível e CTA. A copy
precisa corresponder ao estágio de consciência e à página de destino. Liste
pixel, evento, UTMs, domínio, destino e convenção de nomes antes do handoff.
Se tracking, ativo de conversão ou destino estiverem ausentes, o plano fica
incompleto e não vira rascunho de campanha.

## Preview, validação e falha

Gere preview contendo objetivo, evento, estrutura, público, placements,
criativos, orçamento planejado, nomes, tracking e limitações. Valide campos
obrigatórios, coerência entre oferta e funil, duplicidade de nomes, direitos
dos ativos e risco regulatório. Leituras auxiliares indisponíveis devem gerar
lacuna explícita, sem substituir informação por suposição.

O handoff só pode produzir um draft `PAUSED`. Falha de validação, ausência de
approval ou dados críticos incompletos bloqueiam a criação e preservam o plano
para correção, sem tentar uma alternativa automática.

## Nota histórica

Existe um registro histórico de runtime separado. Ele não é fonte metodológica
canônica nem pré-requisito para aplicar este guia.
