import { createJsonStore } from './json-store.js';

export function createJsonRepository(collectionName) {
  const store = createJsonStore(collectionName, []);

  function readAll() {
    const value = store.read();
    return Array.isArray(value) ? value : [];
  }

  return {
    adapter: 'json',
    list() {
      return readAll();
    },
    get(id) {
      return readAll().find((item) => item.id === id) || null;
    },
    upsert(entity) {
      const items = readAll();
      const index = items.findIndex((item) => item.id === entity.id);
      if (index >= 0) items[index] = entity;
      else items.push(entity);
      store.write(items);
      return entity;
    },
    remove(id) {
      const items = readAll();
      const next = items.filter((item) => item.id !== id);
      if (next.length === items.length) return false;
      store.write(next);
      return true;
    },
    clear() {
      store.clear();
    }
  };
}
