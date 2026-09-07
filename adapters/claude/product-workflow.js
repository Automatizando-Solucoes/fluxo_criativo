'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  assertProductSlug,
  getProductPath,
} = require('../../core/state/product-state');

const PRODUCT_TYPES = Object.freeze(['Low Ticket', 'Middle Ticket']);
const DELIVERY_DIRECTORIES = Object.freeze([
  'entregas/paginas',
  'entregas/emails',
  'entregas/copy-pagina',
  'entregas/criativos',
  'entregas/comercial',
  'entregas/textos-de-venda',
]);

function assertNonEmptyText(value, field) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${field} must be a non-empty string`);
  }
  return value.trim();
}

function assertProductType(type) {
  if (!PRODUCT_TYPES.includes(type)) {
    throw new TypeError(`product type must be one of: ${PRODUCT_TYPES.join(', ')}`);
  }
  return type;
}

function productsRoot(projectRoot) {
  return path.join(path.resolve(projectRoot), 'meus-produtos');
}

function activeProductPath(projectRoot) {
  return path.join(productsRoot(projectRoot), '.ativo');
}

function getProductDisplayName(productPath, slug) {
  const namePath = path.join(productPath, 'nome.txt');
  if (fs.existsSync(namePath)) {
    const name = fs.readFileSync(namePath, 'utf8').trim();
    if (name) return name;
  }
  return slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function getPanelPath(productPath) {
  const standardPanel = path.join(productPath, 'painel-entregas.html');
  if (fs.existsSync(standardPanel)) return 'painel-entregas.html';
  const alternative = fs.readdirSync(productPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^painel-.*\.html$/.test(entry.name))
    .map((entry) => entry.name)
    .sort()[0];
  return alternative || null;
}

function listProducts(projectRoot) {
  const root = productsRoot(projectRoot);
  if (!fs.existsSync(root)) return [];

  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.'))
    .map((entry) => {
      const slug = entry.name;
      // Ignore unrelated directories rather than exposing an unsafe product identifier.
      try {
        assertProductSlug(slug);
      } catch {
        return null;
      }
      const productPath = path.join(root, slug);
      const panel = getPanelPath(productPath);
      return {
        slug,
        nome: getProductDisplayName(productPath, slug),
        url: panel ? `${slug}/${panel}` : null,
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.slug.localeCompare(right.slug));
}

function refreshPanelManifest(projectRoot) {
  const root = productsRoot(projectRoot);
  fs.mkdirSync(root, { recursive: true });
  const products = listProducts(projectRoot);
  const activePath = activeProductPath(projectRoot);
  const requestedActive = fs.existsSync(activePath) ? fs.readFileSync(activePath, 'utf8').trim() : null;
  const active = products.some((product) => product.slug === requestedActive)
    ? requestedActive
    : (products[0] ? products[0].slug : null);
  const manifest = {
    schema_version: 1,
    ativo: active,
    atualizado_em: new Date().toISOString(),
    produtos: products,
  };
  fs.writeFileSync(
    path.join(root, 'index.js'),
    `// Gerado pelo contrato local adapters/claude/product-workflow.js.\nwindow.MEUS_PRODUTOS = ${JSON.stringify(manifest, null, 2)};\n`,
    'utf8',
  );
  return manifest;
}

function activateProduct({ projectRoot, slug }) {
  const safeSlug = assertProductSlug(slug);
  const productPath = getProductPath(safeSlug, projectRoot);
  if (!fs.existsSync(productPath) || !fs.statSync(productPath).isDirectory()) {
    throw new Error(`product does not exist: ${safeSlug}`);
  }
  fs.mkdirSync(productsRoot(projectRoot), { recursive: true });
  fs.writeFileSync(activeProductPath(projectRoot), `${safeSlug}\n`, 'utf8');
  return {
    slug: safeSlug,
    product_path: productPath,
    manifest: refreshPanelManifest(projectRoot),
  };
}

function createProduct({ projectRoot, slug, name, type, price }) {
  const safeSlug = assertProductSlug(slug);
  const displayName = assertNonEmptyText(name, 'name');
  const productType = assertProductType(type);
  const productPrice = assertNonEmptyText(price, 'price');
  const productPath = getProductPath(safeSlug, projectRoot);

  if (fs.existsSync(productPath)) {
    throw new Error(`product already exists: ${safeSlug}`);
  }

  fs.mkdirSync(productsRoot(projectRoot), { recursive: true });
  fs.mkdirSync(productPath, { recursive: false });
  for (const relativeDirectory of DELIVERY_DIRECTORIES) {
    fs.mkdirSync(path.join(productPath, relativeDirectory), { recursive: true });
  }
  fs.writeFileSync(path.join(productPath, 'nome.txt'), `${displayName}\n`, 'utf8');
  fs.writeFileSync(path.join(productPath, 'tipo.md'), `${productType}\n`, 'utf8');
  fs.writeFileSync(path.join(productPath, 'preco.md'), `${productPrice}\n`, 'utf8');

  return activateProduct({ projectRoot, slug: safeSlug });
}

module.exports = {
  PRODUCT_TYPES,
  DELIVERY_DIRECTORIES,
  listProducts,
  refreshPanelManifest,
  activateProduct,
  createProduct,
};
