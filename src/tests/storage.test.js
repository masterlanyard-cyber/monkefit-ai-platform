import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'monkefit-ai-storage-'));
process.env.DATA_DIR = tempDirectory;

const { createJsonStore } = await import('../storage/json-store.js');

test('JSON store writes and reads persisted values', () => {
  const store = createJsonStore('test-records', []);
  store.write([{ id: 'A-1', value: 42 }]);
  assert.deepEqual(store.read(), [{ id: 'A-1', value: 42 }]);
  assert.equal(fs.existsSync(store.filePath), true);
});

test('JSON store clear restores the default value', () => {
  const store = createJsonStore('clear-records', []);
  store.write([{ id: 'A-2' }]);
  store.clear();
  assert.deepEqual(store.read(), []);
});
