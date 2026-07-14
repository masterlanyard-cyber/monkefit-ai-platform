import fs from 'node:fs';
import path from 'node:path';

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

export function createJsonStore(name, defaultValue) {
  const dataDirectory = path.resolve(process.env.DATA_DIR || './data');
  const filePath = path.join(dataDirectory, `${name}.json`);
  ensureDirectory(dataDirectory);

  function read() {
    if (!fs.existsSync(filePath)) return structuredClone(defaultValue);
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error(`Unable to read ${filePath}:`, error);
      return structuredClone(defaultValue);
    }
  }

  function write(value) {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(value, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
    return value;
  }

  function clear() {
    write(structuredClone(defaultValue));
  }

  return { filePath, read, write, clear };
}
