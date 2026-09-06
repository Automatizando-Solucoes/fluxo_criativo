'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/;
const ARTIFACT_PATHS = Object.freeze({
  profile: 'perfil.md',
  consumer: 'idconsumidor.md',
  research: 'pesquisa-mercado.md',
  type: 'tipo.md',
  deliveries: 'entregas',
  agent_memory: 'agentes',
});

function assertProjectRoot(projectRoot) {
  if (typeof projectRoot !== 'string' || projectRoot.length === 0) {
    throw new TypeError('project root must be a non-empty path');
  }
  return path.resolve(projectRoot);
}

function assertProductSlug(slug) {
  if (typeof slug !== 'string' || !PRODUCT_SLUG_PATTERN.test(slug)) {
    throw new TypeError('product slug must contain only lowercase letters, digits and internal hyphens');
  }
  return slug;
}

function withinProductsRoot(projectRoot, target) {
  const productsRoot = path.join(projectRoot, 'meus-produtos');
  const relative = path.relative(productsRoot, target);
  if (relative === '' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error('resolved path escapes meus-produtos');
  }
  return target;
}

function getProductPath(slug, projectRoot = PROJECT_ROOT) {
  const root = assertProjectRoot(projectRoot);
  const safeSlug = assertProductSlug(slug);
  return withinProductsRoot(root, path.join(root, 'meus-produtos', safeSlug));
}

function getActiveProduct(projectRoot = PROJECT_ROOT) {
  const root = assertProjectRoot(projectRoot);
  const activePath = path.join(root, 'meus-produtos', '.ativo');
  if (!fs.existsSync(activePath)) return null;
  const slug = fs.readFileSync(activePath, 'utf8').trim();
  if (!slug) return null;
  return assertProductSlug(slug);
}

function getArtifactPath(slug, artifactType, projectRoot = PROJECT_ROOT) {
  if (!Object.hasOwn(ARTIFACT_PATHS, artifactType)) {
    throw new TypeError(`unknown artifact type: ${artifactType}`);
  }
  const root = assertProjectRoot(projectRoot);
  return withinProductsRoot(root, path.join(getProductPath(slug, root), ARTIFACT_PATHS[artifactType]));
}

module.exports = {
  PROJECT_ROOT,
  ARTIFACT_PATHS,
  assertProductSlug,
  getActiveProduct,
  getProductPath,
  getArtifactPath,
  get_active_product: getActiveProduct,
  get_product_path: getProductPath,
  get_artifact_path: getArtifactPath,
};
