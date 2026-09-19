'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { validatePageHtml } = require('../../core/local/workflows');

test('page sales permits the canonical Automatizando contact form link', () => {
  assert.equal(
    validatePageHtml('<html><body><a href="https://automatizando.site/contato">Quero solicitar meu diagnóstico</a></body></html>'),
    true,
  );
});

test('page sales continues blocking unapproved absolute URLs', () => {
  assert.throws(
    () => validatePageHtml('<html><body><a href="https://example.test/capture">CTA</a></body></html>'),
    /relative paths/,
  );
  assert.throws(
    () => validatePageHtml('<html><body><img src="https://example.test/image.png"></body></html>'),
    /relative paths/,
  );
});
