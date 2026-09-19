# Plano: geração de imagem Nano Banana 2

> Criado em 12/09/2026. Status: implementação técnica concluída; falta usar `creative.static` em um criativo comercial aprovado. Escopo: gerar imagem com Nano Banana 2, injeção 1Password, validação de artefato e encadeamento explícito com `creative.static`.

## Objetivo

Permitir que `creative.static` gere um artefato de imagem real usando Gemini Nano Banana 2 (`gemini-3.1-flash-image`), sem expor `GEMINI_API_KEY` e com validação do resultado antes de persistir a entrega.

## Decisões verificadas

- Provider escolhido: Gemini API direta, pois Nano Banana 2 é o modelo estável oficial e existe item `GEMINI_API_KEY` no vault `OMNIVERSO`.
- Transporte oficial: `POST https://generativelanguage.googleapis.com/v1beta/interactions` com `x-goog-api-key` apenas no processo filho.
- Modelo inicial: `gemini-3.1-flash-image`; não secreto e configurável.
- A referência 1Password será local em `.env.op`, ignorada pelo Git, com permissão 600.

## Critérios de sucesso

- [x] `image.generate` aceita provider `gemini` e valida modelo, aspecto, resolução e prompt.
- [x] O processo de rede é iniciado exclusivamente via `op run --env-file=.env.op`; nenhum segredo é retornado ao Node, logs ou artefatos.
- [x] Uma resposta base64 do Gemini é validada por MIME, assinatura e limites antes de gravar a imagem.
- [x] A imagem e um manifesto sanitizado são persistidos em `entregas/criativos/`.
- [x] `creative.static` encadeia para `image.generate` somente quando solicitado explicitamente.
- [x] Testes unitários cobrem sucesso local, conteúdo inválido, segredo/gate ausente e ausência de chamada externa sem aprovação.
- [!] Uma geração real com custo ainda depende de autorização específica para o primeiro smoke test.

## Fases

### Fase 1 — Segurança e contrato

- [x] Criar `.env.op` com referência `op://` ao campo oculto de `GEMINI_API_KEY` e validar somente presença booleana.
  - Evidência: `op run` confirmou `GEMINI_API_KEY` presente sem imprimir valor; arquivo em modo 600 e ignorado pelo Git.
- [x] Definir contrato de request/resultado e allowlist de modelo no core.

### Fase 2 — Transporte e artefato

- [x] Criar processo Python isolado para chamar a Gemini API por arquivo temporário e emitir resultado sanitizado.
- [x] Criar adapter Node que injeta o segredo no filho via 1Password e salva somente artefato validado + manifesto.
- [x] Verificação: testes com processo falso, sem rede nem `op` real.

### Fase 3 — Orquestração e QA

- [x] Conectar `creative.static` ao adapter apenas com flag explícita de execução.
- [x] Executar TDD, suíte relevante e scanner de segredos.
- [x] Atualizar docs e mapas.
- [x] Verificação live: o runtime canônico agora usa o SDK oficial `@google/genai` (2.22.0), com `interactions.create`, `store: false` e `output_image` do SDK. Uma geração real retornou JPEG válido, persistido com manifesto sanitizado; publicação não foi solicitada.

## Riscos e limites

- A presença da referência não confirma permissão do projeto Gemini nem saldo; isso exige uma chamada real e cobrável.
- Imagens, prompts e manifests podem ser dados comerciais; somente os artefatos solicitados ficam no produto, sem segredo ou payload bruto.
- O workflow não deve publicar, anexar ou enviar imagens automaticamente.
