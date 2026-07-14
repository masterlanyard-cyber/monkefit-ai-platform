import fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const ACTIVE_SECTIONS = [
  'company','products','service','pricing','sales','faq','decision_engine',
  'intelligence','consultant','ai','learning','uat','validation'
];

export async function loadKnowledgeBase(rootDir = process.env.MKB_ROOT || './mkb') {
  const indexPath = path.resolve(rootDir, 'index.yaml');
  const index = yaml.load(await fs.readFile(indexPath, 'utf8'));
  const documents = [];
  const missing = [];

  for (const section of ACTIVE_SECTIONS) {
    const entries = Array.isArray(index?.[section]) ? index[section] : [];
    for (const relativePath of entries) {
      const absolutePath = path.resolve(relativePath);
      try {
        const raw = await fs.readFile(absolutePath, 'utf8');
        const ext = path.extname(relativePath).toLowerCase();
        const parsed = ['.yaml', '.yml'].includes(ext) ? yaml.load(raw) : raw;
        documents.push({ section, path: relativePath, raw, parsed });
      } catch (error) {
        missing.push({ path: relativePath, error: error.message });
      }
    }
  }

  return {
    index,
    documents,
    missing,
    loadedAt: new Date().toISOString(),
    healthy: missing.length === 0
  };
}

export function buildKnowledgeContext(kb, sections = null) {
  const selected = sections?.length
    ? kb.documents.filter((doc) => sections.includes(doc.section))
    : kb.documents;

  return selected.map((doc) => `SOURCE: ${doc.path}\n${doc.raw}`).join('\n\n---\n\n');
}
