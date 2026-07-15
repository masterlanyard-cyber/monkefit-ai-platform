export function createMemoryRepository(collectionName) {
  const records = new Map();

  return {
    adapter: 'memory',
    collectionName,
    list() {
      return [...records.values()];
    },
    get(id) {
      return records.get(id) || null;
    },
    upsert(entity) {
      records.set(entity.id, entity);
      return entity;
    },
    remove(id) {
      return records.delete(id);
    },
    clear() {
      records.clear();
    }
  };
}
