import { createJsonRepository } from './json-repository.js';
import { createSqliteRepository } from './sqlite-repository.js';

const repositories = new Map();

export function createRepository(collectionName) {
  if (repositories.has(collectionName)) return repositories.get(collectionName);

  const requestedAdapter = (process.env.STORAGE_ADAPTER || 'json').toLowerCase();
  let repository;

  if (requestedAdapter === 'sqlite') {
    try {
      repository = createSqliteRepository(collectionName);
    } catch (error) {
      console.warn(`SQLite unavailable for ${collectionName}; falling back to JSON:`, error.message);
      repository = createJsonRepository(collectionName);
    }
  } else {
    repository = createJsonRepository(collectionName);
  }

  repositories.set(collectionName, repository);
  return repository;
}

export function getStorageStatus() {
  const configured = (process.env.STORAGE_ADAPTER || 'json').toLowerCase();
  return {
    configured,
    activeAdapters: [...new Set([...repositories.values()].map((repo) => repo.adapter))]
  };
}
