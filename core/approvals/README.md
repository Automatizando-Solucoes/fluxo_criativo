# Contrato de aprovação

`ApprovalPolicy` é um objeto serializável, não um executor. Ele associa uma autorização a `workflow_id` e pode delimitar produto, rede e tipo de ação.

Os modos válidos são:

- `manual`: exige uma autorização explícita para a ação. É o padrão para ativação de campanha, aumento de orçamento, escala financeira, exclusão e efeitos externos irreversíveis.
- `standing`: autorização explícita reutilizável, limitada por escopo, validade e limites. Pode ser usada para pesquisa, dashboards, relatórios e conteúdo previamente aprovado.
- `disabled`: a ação não está autorizada; não significa ausência de aprovação.

Os campos suportados são `workflow_id`, `product`, `network`, `action_type`, `expires_at`, `limits`, `authorized_by`, `created_at` e `revoked_at`. O mesmo escopo também é exposto em `scope` para o formato documentado. Uma policy expirada, revogada, sem autorizador ou `disabled` não permite prosseguir.
