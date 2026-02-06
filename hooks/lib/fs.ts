import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, resolve, normalize } from 'path';
import { existsSync } from 'fs';

export function validatePath(basePath: string, targetPath: string): string {
  const base = resolve(basePath);
  const target = resolve(normalize(targetPath));
  
  if (!target.startsWith(base)) {
    throw new Error(`Path traversal detected: ${targetPath}`);
  }
  
  return target;
}

export async function safeReadFile(path: string): Promise<string> {
  return await readFile(path, 'utf-8');
}

export async function safeWriteFile(path: string, content: string): Promise<void> {
  await writeFile(path, content, 'utf-8');
}

export async function ensureDir(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

export async function listFiles(dir: string, extension?: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = entries
    .filter(entry => entry.isFile())
    .map(entry => entry.name);
  
  if (extension) {
    return files.filter(file => file.endsWith(extension));
  }
  
  return files;
}
