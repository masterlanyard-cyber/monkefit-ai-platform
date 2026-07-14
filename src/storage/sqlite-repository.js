import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export function createSqliteRepository(collectionName) {
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch {
    throw new Error('SQLite adapter requires optional dependency better-sqlite3');
  }

  const dataDirectory = path.resolve(process.env.DATA_DIR || './data');
  fs.mkdirSync(dataDirectory, { recursive: true });
  const databasePath = path.resolve(process.env.SQLITE_PATH || path.join(dataDirectory, 'monkefit.db'));
  const db = new Database(databasePath);

  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS entity_store (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (collection, id)
    )
  `);

  const listStatement = db.prepare(
    'SELECT payload FROM entity_store WHERE collection = ? ORDER BY updated_at DESC'
  );
  const getStatement = db.prepare(
    'SELECT payload FROM entity_store WHERE collection = ? AND id = ?'
  );
  const upsertStatement = db.prepare(`
    INSERT INTO entity_store (collection, id, payload, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(collection, id)
    DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
  `);
  const removeStatement = db.prepare(
    'DELETE FROM entity_store WHERE collection = ? AND id = ?'
  );
  const clearStatement = db.prepare(
    'DELETE FROM entity_store WHERE collection = ?'
  );

  return {
    adapter: 'sqlite',
    databasePath,
    list() {
      return listStatement.all(collectionName).map((row) => JSON.parse(row.payload));
    },
    get(id) {
      const row = getStatement.get(collectionName, id);
      return row ? JSON.parse(row.payload) : null;
    },
    upsert(entity) {
      upsertStatement.run(
        collectionName,
        entity.id,
        JSON.stringify(entity),
        entity.updatedAt || new Date().toISOString()
      );
      return entity;
    },
    remove(id) {
      return removeStatement.run(collectionName, id).changes > 0;
    },
    clear() {
      clearStatement.run(collectionName);
    }
  };
}
