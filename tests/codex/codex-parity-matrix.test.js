#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path'); const { buildCodexParityMatrix } = require('../../adapters/codex/parity');
const matrix = buildCodexParityMatrix(); const distribution = Object.fromEntries(matrix.reduce((map, item) => map.set(item.codex_status, (map.get(item.codex_status) || 0) + 1), new Map()));
assert.equal(matrix.length, 26); assert.deepEqual(distribution, { CODEX_READY: 12, CODEX_EXTERNAL_DRY_RUN: 12, CODEX_LEGACY: 1, CODEX_BLOCKED_EXTERNAL: 1 }); for (const item of matrix) assert.equal(fs.existsSync(path.resolve(__dirname, '../..', item.methodology_source)), true);
process.stdout.write('Codex parity matrix: ok\n');
