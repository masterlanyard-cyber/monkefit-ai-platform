import { createJsonRepository } from './json-repository.js';
import { createSqliteRepository } from './sqlite-repository.js';
import { createMemoryRepository } from './memory-repository.js';

const repositories = new Map();

function createJsonWithFallback(collectionName) {
  try {
    return createJsonRepository(collectionName);
  } catch (error) {
    console.warn(`JSON storage unavailable for ${collectionName}; falling back to memory:`, error.message);
    return createMemoryRepository(collectionName);
  }
}

export function createRepository(collectionName) {
  if (repositories.has(collectionName)) return repositories.get(collectionName);

  const requestedAdapter = (process.env.STORAGE_ADAPTER || 'json').toLowerCase();
  let repository;

  if (requestedAdapter === 'sqlite') {
    try {
      repository = createSqliteRepository(collectionName);
    } catch (error) {
      console.warn(`SQLite unavailable for ${collectionName}; falling back to JSON:`, error.message);
      repository = createJsonWithFallback(collectionName);
    }
  } else if (requestedAdapter === 'memory') {
    repository = createMemoryRepository(collectionName);
  } else {
    repository = createJsonWithFallback(collectionName);
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
