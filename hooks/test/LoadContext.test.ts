import { test, expect, describe } from 'bun:test';
import { validatePath, listFiles } from '../lib/fs';
import { join } from 'path';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { tmpdir } from 'os';

describe('LoadContext Hook - Property Tests', () => {
  test('idempotency: loading same files produces identical context', async () => {
    const testDir = await mkdtemp(join(tmpdir(), 'telos-test-'));
    
    try {
      // Create test files
      await writeFile(join(testDir, 'BELIEFS.md'), '# Beliefs\n\nTest content');
      await writeFile(join(testDir, 'GOALS.md'), '# Goals\n\nTest goals');
      
      // Load twice
      const files1 = await listFiles(testDir, '.md');
      const files2 = await listFiles(testDir, '.md');
      
      expect(files1).toEqual(files2);
      expect(files1.length).toBe(2);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
  
  test('completeness: all valid TELOS files are discovered', async () => {
    const testDir = await mkdtemp(join(tmpdir(), 'telos-test-'));
    
    try {
      const expectedFiles = ['BELIEFS.md', 'GOALS.md', 'MISSION.md'];
      
      for (const file of expectedFiles) {
        await writeFile(join(testDir, file), `# ${file}\n\nContent`);
      }
      
      const discovered = await listFiles(testDir, '.md');
      
      expect(discovered.sort()).toEqual(expectedFiles.sort());
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
  
  test('resilience: missing directory does not crash', async () => {
    const nonExistentDir = join(tmpdir(), 'does-not-exist-' + Date.now());
    
    await expect(listFiles(nonExistentDir, '.md')).rejects.toThrow();
  });
  
  test('security: path traversal is prevented', () => {
    const basePath = '/home/user/.kiro/context/telos';
    const maliciousPath = '../../../etc/passwd';
    
    expect(() => validatePath(basePath, maliciousPath)).toThrow('Path traversal detected');
  });
});
