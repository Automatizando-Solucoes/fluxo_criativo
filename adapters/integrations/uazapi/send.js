'use strict';

const { immutableCopy } = require('../../../core/contracts/immutable');

function maskNumber(number) {
  if (typeof number !== 'string' || !/^\d{10,15}$/.test(number)) throw new TypeError('number must use 10 to 15 international digits');
  return `${number.slice(0, 4)}***${number.slice(-2)}`;
}

function createUazapiSendDescriptor({ base_url, number, text, secretProvider }) {
  if (typeof base_url !== 'string' || !/^https:\/\/[^\s]+$/i.test(base_url)) throw new TypeError('base_url must be an HTTPS URL');
  if (typeof text !== 'string' || text.trim().length === 0) throw new TypeError('text is required');
  if (!secretProvider || !secretProvider.has_secret('UAZAPI_TOKEN')) return immutableCopy({ provider: 'uazapi', capability: 'notification.send', sent: false, dry_run: true, error: 'secret_unavailable' });
  secretProvider.run_with_secrets({ id: 'notification.send', allowed_secret_names: ['UAZAPI_TOKEN'] }, ['UAZAPI_TOKEN']);
  return immutableCopy({ provider: 'uazapi', capability: 'notification.send', endpoint: '/send/text', method: 'POST', number_masked: maskNumber(number), sent: false, dry_run: true, error: null });
}

module.exports = { createUazapiSendDescriptor, maskNumber };
