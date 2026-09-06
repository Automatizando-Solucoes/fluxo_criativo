'use strict';

const { immutableCopy } = require('../../core/contracts/immutable');

const AGENT_ROLES = Object.freeze(['INTERACTIVE_MAIN', 'DELEGATE', 'DEFERRED']);

const agentMappings = immutableCopy([
  ...[
    'estrategista-de-produto', 'estrategista-low-ticket', 'estrategista-middle-ticket',
    'estrategista-ht', 'executor-de-plano-de-acao', 'copywriter', 'construtor-de-paginas',
    'criador-de-campanhas', 'consultor-comercial', 'video-maker',
  ].map((agent) => ({ agent, role: 'INTERACTIVE_MAIN', enabled: false })),
  ...[
    'pesquisa-mercado', 'revisor-pesquisa', 'revisor-perfil', 'revisor-idconsumidor',
    'gerador-decorados', 'gerador-urgencias-ocultas', 'gerador-idconsumidor',
  ].map((agent) => ({ agent, role: 'DELEGATE', enabled: false })),
  {
    agent: 'clonador-de-bloco-visual', role: 'DEFERRED', enabled: false,
    reason: 'Pode modificar arquivos ou depender de provider; não recebe delegate Hermes até existir gate específico.',
  },
]);

function getAgentMapping(agent) {
  const mapping = agentMappings.find((entry) => entry.agent === agent);
  if (!mapping) throw new Error(`unmapped Hermes agent: ${agent}`);
  return mapping;
}

module.exports = { AGENT_ROLES, agentMappings, getAgentMapping };
