# Mapa — Fluxo Criativo

## Propósito

Clone operacional do `Automatizando-Solucoes/fluxo_criativo`. A base organiza workflows de marketing; estados de produto ficam em `meus-produtos/` e são ignorados pelo Git.

## Rotas principais

- `core/`: contratos e regras neutras de workflow.
- `adapters/hermes/`: execução e boundaries do runtime Hermes.
- `adapters/hermes/gemini-image-live.js`: adapter live local para Nano Banana 2; só executa com aprovação manual explícita.
- `scripts/gemini-nano-banana-runtime.js`: processo isolado baseado no SDK oficial `@google/genai`, que recebe `GEMINI_API_KEY` apenas por `op run` e chama a Gemini API.
- `scripts/gemini-nano-banana-runtime.py`: protótipo REST anterior; não é o runtime canônico.
- `tests/hermes/gemini-image-live.test.js`: contrato de request, validação de MIME/assinatura, persistência e bloqueio sem aprovação.
- `.hermes/plans/integracao-nano-banana.md`: plano vivo da integração.

## Imagens Nano Banana

Provider configurado: Gemini API direta, modelo `gemini-3.1-flash-image` (Nano Banana 2). A referência não secreta está em `.env.op`, ignorada pelo Git e com modo 600; o valor permanece exclusivamente no vault `OMNIVERSO` do 1Password. Artefatos gerados são gravados em `meus-produtos/<slug>/entregas/criativos/` junto de manifesto sanitizado. Publicação automática não existe.

## Estado

Adapter, injeção de segredo, persistência e validação foram implementados e testados. Uma geração real controlada em 1K retornou JPEG válido, com manifesto sanitizado; publicação continua não solicitada. O primeiro criativo comercial interno 4:5 do piloto está em `meus-produtos/agente-ia-pre-vendas-hotelaria/entregas/criativos/criativo-feed-fila-atendimento.png`; a publicação ou distribuição externa continua bloqueada.

## Curadoria

Não registrar neste repositório `.env`, `.env.*`, tokens, chaves, payloads de resposta, arquivos temporários de runtime ou imagens de clientes sem necessidade operacional. `meus-produtos/` permanece estado local e não é backup Git.
