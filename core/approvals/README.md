# Contrato de aprovação

`ApprovalPolicy` é um objeto serializável, não um executor. Ele associa uma autorização a `workflow_id` e pode delimitar produto, rede e tipo de ação. A avaliação sempre recebe também o contexto real da ação: `workflow_id`, `product`, `network`, `action_type`, `action_id`, `now` e, quando houver limites, `usage`.

Os modos válidos são:

- `manual`: exige uma autorização explícita para uma ação específica. O `manual_grant` contém `action_id`, `approved_by` e `approved_at`; ele só vale para o mesmo `action_id` avaliado. `authorized_by` não transforma manual em autorização permanente.
- `standing`: autorização explícita reutilizável, limitada por escopo, validade e limites. Pode ser usada para pesquisa, dashboards, relatórios e conteúdo previamente aprovado.
- `disabled`: a ação não está autorizada; não significa ausência de aprovação.

Os campos suportados são `workflow_id`, `product`, `network`, `action_type`, `expires_at`, `limits`, `authorized_by`, `created_at`, `revoked_at` e `manual_grant`. O mesmo escopo também é exposto em `scope` para o formato documentado. Uma policy expirada, revogada, sem autorizador (em `standing`) ou `disabled` não permite prosseguir.

`limits` é um mapa de limites numéricos inclusivos. Cada chave precisa existir em `context.usage` como número não negativo. Se algum limite não puder ser avaliado, o resultado é fail-closed: `limits_not_evaluated`. Se o uso excede o valor, o resultado é `limit_exceeded:<chave>`.

Antes de autorizar, o evaluator valida `workflow_id` e qualquer delimitador de produto, rede ou tipo de ação. Divergências retornam `workflow_mismatch`, `product_mismatch`, `network_mismatch` ou `action_type_mismatch`.
