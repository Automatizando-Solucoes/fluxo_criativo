#!/usr/bin/env node
// Local-only PostToolUse status bridge for the Workshop panel.
// It reads hook input and writes status files inside this checkout only.

const fs = require('fs')
const path = require('path')

const AGENT_BY_SKILL = {
  'produto-novo': 'estrategista-de-produto',
  'produto-concepcao': 'estrategista-de-produto',
  'pesquisa-mercado': 'estrategista-de-produto',
  'copy-pagina': 'construtor-de-paginas',
  'copy-anuncio': 'criador-de-campanhas',
  'copy-social': 'produtor-de-conteudo',
  'copy-roteiro': 'video-maker',
  'criativo-estatico': 'criador-de-campanhas',
  carrossel: 'produtor-de-conteudo',
  'comercial-playbook': 'consultor-comercial',
  'lt-funil': 'estrategista-low-ticket',
  'lt-criar-produto': 'estrategista-low-ticket',
  'lt-pagina': 'estrategista-low-ticket',
  'trafego-insights': 'criador-de-campanhas',
  'trafego-otimizar': 'criador-de-campanhas',
  'trafego-criar-campanha': 'criador-de-campanhas',
  'video-heygen': 'video-maker',
  'video-remotion': 'video-maker',
  'video-editar': 'video-maker',
  'toolkit-executar': 'executor-de-plano-de-acao',
}

const CATEGORY_BY_AGENT = {
  'estrategista-de-produto': 'prod',
  'estrategista-low-ticket': 'prod',
  'estrategista-middle-ticket': 'prod',
  'executor-de-plano-de-acao': 'prod',
  copywriter: 'copy',
  'produtor-de-conteudo': 'copy',
  'construtor-de-paginas': 'pag',
  'criador-de-campanhas': 'ad',
  'video-maker': 'vid',
  'consultor-comercial': 'sales',
  'estrategista-ht': 'sales',
  'pesquisa-mercado': 'data',
  'revisor-pesquisa': 'data',
  'revisor-perfil': 'data',
  'revisor-idconsumidor': 'data',
}

const CATEGORY_BY_SKILL = {
  'pesquisa-mercado': 'data',
  'dados-instagram': 'data',
  'instagram-dashboard': 'data',
  'tiktok-dashboard': 'data',
  'youtube-dashboard': 'data',
  'linkedin-dashboard': 'data',
  'ads-relatorio': 'data',
  'enviar-relatorio-ads': 'data',
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return {}
  }
}

function readActiveProduct(cwd) {
  try {
    return fs.readFileSync(path.join(cwd, 'meus-produtos', '.ativo'), 'utf8').trim()
  } catch {
    return ''
  }
}

function identifyAgent(toolName, toolInput, previous) {
  const skill = toolName === 'Skill' ? String(toolInput.skill || '') : ''
  const delegated = (toolName === 'Agent' || toolName === 'Task')
    ? String(toolInput.subagent_type || '')
    : ''
  return AGENT_BY_SKILL[skill] || delegated || previous || 'estrategista-de-produto'
}

function describeTask(toolName, skill, delegated) {
  if (skill) return `executando ${skill}`
  if (delegated) return `executando ${delegated}`
  const descriptions = {
    Read: 'lendo contexto local',
    Write: 'gravando arquivo local',
    Edit: 'editando arquivo local',
    MultiEdit: 'editando arquivos locais',
    Bash: 'executando comando autorizado',
    WebFetch: 'consultando fonte externa',
    WebSearch: 'pesquisando referências',
  }
  return descriptions[toolName] || 'trabalhando'
}

let input = ''
const timeout = setTimeout(() => process.exit(0), 10000)
process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => { input += chunk })
process.stdin.on('end', () => {
  clearTimeout(timeout)
  try {
    const data = JSON.parse(input || '{}')
    const cwd = data.cwd || process.cwd()
    const toolName = String(data.tool_name || data.tool || '')
    const toolInput = data.tool_input || {}
    const statusFile = path.join(cwd, '.claude', 'agents-memory', 'agents-status.json')
    const status = readJson(statusFile)
    const previous = status._meta && status._meta.lastActive
    const skill = toolName === 'Skill' ? String(toolInput.skill || '') : ''
    const delegated = (toolName === 'Agent' || toolName === 'Task')
      ? String(toolInput.subagent_type || '')
      : ''
    const agent = identifyAgent(toolName, toolInput, previous)
    const category = CATEGORY_BY_SKILL[skill] || CATEGORY_BY_AGENT[agent] || 'prod'
    const timestamp = Date.now()
    const task = describeTask(toolName, skill, delegated)

    status._meta = {
      session: String(data.session_id || ''),
      lastTool: toolName,
      lastActive: agent,
      lastCategory: category,
      lastTask: task,
      lastSkill: skill,
      activeProduct: readActiveProduct(cwd),
      progress: {},
      updated: new Date(timestamp).toLocaleTimeString('pt-BR'),
      timestamp,
    }
    status[agent] = { status: 'working', task, tool: toolName, category, skill, timestamp }
    status.categories = status.categories && typeof status.categories === 'object' ? status.categories : {}
    status.categories[category] = { lastTool: toolName, lastTask: task, lastSkill: skill, lastAgent: agent, timestamp }

    fs.mkdirSync(path.dirname(statusFile), { recursive: true })
    const json = JSON.stringify(status, null, 2)
    fs.writeFileSync(statusFile, json)
    fs.writeFileSync(statusFile.replace(/\.json$/, '.js'), `window.AGENTS_STATUS = ${json};\n`)
  } catch {
    // A status failure must not block the user's operation.
  }
  process.exit(0)
})
