'use strict';

const OP_REFERENCE_PATTERN = /^op:\/\/[^/]+\/[^/]+\/[^/]+$/;

class SecretProviderError extends Error {}

class MockSecretProvider {
  constructor(references = {}, available = {}) {
    this.references = new Map();
    this.available = new Map();
    for (const [name, reference] of Object.entries(references)) {
      if (typeof name !== 'string' || !OP_REFERENCE_PATTERN.test(reference)) {
        throw new SecretProviderError('mock secrets require a logical name and an op:// reference');
      }
      this.references.set(name, reference);
      this.available.set(name, available[name] !== false);
    }
  }

  has_secret(name) {
    return this.references.has(name) && this.available.get(name) === true;
  }

  secret_reference(name) {
    if (!this.references.has(name)) return null;
    return this.references.get(name);
  }

  run_with_secrets(operation, required_secrets) {
    if (!operation || typeof operation !== 'object' || Array.isArray(operation)) {
      throw new SecretProviderError('operation must be an allowlisted operation descriptor');
    }
    if (typeof operation.id !== 'string' || !Array.isArray(operation.allowed_secret_names)) {
      throw new SecretProviderError('operation must declare id and allowed_secret_names');
    }
    if (!Array.isArray(required_secrets) || required_secrets.some((name) => typeof name !== 'string')) {
      throw new SecretProviderError('required_secrets must be an array of logical names');
    }
    for (const name of required_secrets) {
      if (!operation.allowed_secret_names.includes(name)) {
        throw new SecretProviderError(`secret ${name} is not allowlisted for operation ${operation.id}`);
      }
      if (!this.has_secret(name)) {
        throw new SecretProviderError(`required secret is unavailable: ${name}`);
      }
    }
    return Object.freeze({
      operation_id: operation.id,
      required_secrets: Object.freeze([...required_secrets]),
      injected: false,
      status: 'ready_for_runtime_injection',
    });
  }
}

module.exports = { MockSecretProvider, SecretProviderError, OP_REFERENCE_PATTERN };
