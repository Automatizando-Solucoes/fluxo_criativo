---
name: workshop-marketing:trafego-analise
description: Analisa resultados normalizados de tráfego sem acoplar análise a autenticação Meta.
allowed-tools: Read, Write
---

# Análise de tráfego

Consuma primeiro insights já normalizados, artefatos do produto ou fixtures. A análise pode calcular indicadores, identificar fadiga, comparar períodos e produzir recomendações sem acesso a credenciais ou à conta Meta.

Quando a aquisição de dados for necessária, solicite o descriptor `ads.insights` com `META_AD_ACCOUNT_ID`, período, campos e breakdown. A aquisição é separada da análise; `META_ACCESS_TOKEN` é requisito lógico exclusivo do adapter.

Use a metodologia canônica em `agents/skills/trafego-analise/SKILL.md`. Recomendações não executam mudanças. Qualquer alteração posterior deve ser uma operação tipada, com ApprovalPolicy própria. Não leia `.env`, não use aliases legados e não construa chamadas diretas à Graph API.
