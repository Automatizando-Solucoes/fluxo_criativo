# Plano: rastreabilidade de custo de imagens Gemini

> Criado em 13/09/2026 (America/Manaus). Status: execução.

## Objetivo

Registrar, junto de cada imagem Gemini gerada, o uso retornado pelo provider quando disponível e uma estimativa de custo em USD baseada na tabela oficial vigente no momento da execução. Diferenciar explicitamente estimativa técnica de valor faturado.

## Sucesso =

- [ ] Cada manifesto novo inclui modelo, resolução, uso do provider quando retornado, base de preço e custo estimado em USD.
- [ ] Quando o provider não retornar uso, o manifesto declara a limitação e ainda registra o custo estimado de saída pela resolução.
- [ ] Nenhuma credencial, payload de imagem ou prompt sensível é incluído no manifesto.
- [ ] Testes verificam cálculo de imagem 1K, uso opcional e compatibilidade com manifestos existentes.
- [ ] O mapa do produto documenta a rota de consulta do custo.

## Tarefas

### Fase 1: contrato e testes

- [~] **T1.1** — Inspecionar resposta do Gemini e o contrato atual de manifesto.
  - Verificação: campos de uso disponíveis e lacuna atual documentados.
  - Depende de: nenhuma.
- [ ] **T1.2** — Adicionar testes que definam extração de uso e estimativa de custo 1K antes da implementação.
  - Verificação: testes falham porque o contrato ainda não existe.
  - Depende de: T1.1.

### Fase 2: implementação mínima

- [ ] **T2.1** — Normalizar uso seguro da resposta Gemini e calcular estimativa de custo em USD.
  - Verificação: testes novos passam e o manifesto mantém compatibilidade.
  - Depende de: T1.2.
- [ ] **T2.2** — Persistir os campos de custo no manifesto de geração.
  - Verificação: teste lê o JSON persistido e encontra status, preço-base e total estimado.
  - Depende de: T2.1.

### Fase 3: verificação e documentação

- [ ] **T3.1** — Executar testes específicos e a suíte Node aplicável.
  - Verificação: todos passam sem regressão.
  - Depende de: T2.2.
- [ ] **T3.2** — Atualizar o MAPA do produto com a rota de custo e sua limitação de faturamento.
  - Verificação: mapa aponta para manifestos e distingue estimativa de fatura.
  - Depende de: T3.1.

## Riscos

- O SDK pode não devolver `usageMetadata` em todas as respostas. Mitigação: manifestar `provider_usage_unavailable`, sem inventar tokens.
- A tabela comercial pode mudar. Mitigação: salvar versão, URL e preço-base em cada manifesto; fatura Google continua fonte de verdade.

## Estado atual

A geração já persiste provider, modelo, hash e horário, mas não uso nem custo. Os manifestos existentes não serão reescritos como se tivessem uso/fatura histórico.