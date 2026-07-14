import { loadKnowledgeBase } from '../engine/knowledge-loader.js';

const kb = await loadKnowledgeBase();

console.log(JSON.stringify({
  healthy: kb.healthy,
  documents: kb.documents.length,
  missing: kb.missing
}, null, 2));

if (!kb.healthy) process.exitCode = 1;
