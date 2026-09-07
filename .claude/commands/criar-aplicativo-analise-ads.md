---
name: workshop-marketing:criar-aplicativo-analise-ads
description: Guia humano para preparar um App Meta sem coletar nem persistir credenciais.
allowed-tools: Read, WebFetch, WebSearch
---

# Preparar App Meta para Ads

Guie o operador pela UI do Meta Developers para criar um app, escolher casos de uso apropriados, associar o portfólio empresarial e revisar permissões necessárias. Esta é uma preparação humana: não publique, não altere ativos e não execute chamadas externas pelo projeto.

Depois de criar o app, direcione para `/gerar-token-permanente-facebook-ads`. Quando a Meta mostrar a credencial, o operador a salva diretamente no 1Password. O projeto reconhece apenas o nome lógico `META_ACCESS_TOKEN`; não recebe valor, não edita `.env` e não cria aliases.

Para encontrar a conta, use `/obter-id-conta-anuncios`, que persiste somente `META_AD_ACCOUNT_ID` como configuração não secreta. Em caso de divergência de UI, pesquise documentação pública da Meta e mantenha a orientação como ação manual do operador.
