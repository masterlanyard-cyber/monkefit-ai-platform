import 'dotenv/config';
import { createJsonRepository } from '../storage/json-repository.js';
import { createSqliteRepository } from '../storage/sqlite-repository.js';

const collections = ['leads', 'sessions'];

for (const collection of collections) {
  const source = createJsonRepository(collection);
  const target = createSqliteRepository(collection);
  const records = source.list();

  for (const record of records) target.upsert(record);

  console.log(`${collection}: migrated ${records.length} records to SQLite`);
}

console.log('Storage migration completed. Set STORAGE_ADAPTER=sqlite to activate SQLite.');
