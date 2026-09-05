'use strict';

function deepFreeze(value, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) {
    deepFreeze(value[key], seen);
  }
  return Object.freeze(value);
}

function immutableCopy(value) {
  return deepFreeze(structuredClone(value));
}

module.exports = { deepFreeze, immutableCopy };
