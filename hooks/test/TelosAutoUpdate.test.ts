import { test, expect, describe } from 'bun:test';
import { createBackup } from '../lib/backup';
import { join } from 'path';
import { mkdtemp, writeFile, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';

describe('TelosAutoUpdate Hook - Property Tests', () => {
  test('integrity: backup files are identical to originals', async () => {
    const testDir = await mkdtemp(join(tmpdir(), 'backup-test-'));
    const backupDir = join(testDir, 'backups');
    
    try {
      const originalPath = join(testDir, 'BELIEFS.md');
      const originalContent = '# Beliefs\n\nTest content that should be preserved';
      
      await writeFile(originalPath, originalContent);
      
      const result = await createBackup(originalPath, backupDir);
      
      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      
      if (result.backupPath) {
        const backupContent = await readFile(result.backupPath, 'utf-8');
        expect(backupContent).toBe(originalContent);
      }
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
  
  test('atomicity: multiple backups create unique files', async () => {
    const testDir = await mkdtemp(join(tmpdir(), 'backup-test-'));
    const backupDir = join(testDir, 'backups');
    
    try {
      const originalPath = join(testDir, 'GOALS.md');
      await writeFile(originalPath, '# Goals\n\nContent');
      
      const result1 = await createBackup(originalPath, backupDir);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Ensure different timestamp
      const result2 = await createBackup(originalPath, backupDir);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.backupPath).not.toBe(result2.backupPath);
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
  
  test('resilience: backup handles missing source gracefully', async () => {
    const testDir = await mkdtemp(join(tmpdir(), 'backup-test-'));
    const backupDir = join(testDir, 'backups');
    
    try {
      const nonExistentPath = join(testDir, 'MISSING.md');
      
      const result = await createBackup(nonExistentPath, backupDir);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    } finally {
      await rm(testDir, { recursive: true, force: true });
    }
  });
});
