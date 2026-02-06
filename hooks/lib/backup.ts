import { copyFile } from 'fs/promises';
import { join, basename } from 'path';
import { ensureDir, safeWriteFile, safeReadFile } from './fs';
import { logger } from './logger';
import type { BackupResult, ChangeLogEntry } from './types';

export async function createBackup(
  filePath: string,
  backupDir: string
): Promise<BackupResult> {
  try {
    await ensureDir(backupDir);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' + 
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    const fileName = basename(filePath, '.md');
    const backupPath = join(backupDir, `${fileName}-${timestamp}.md`);
    
    await copyFile(filePath, backupPath);
    await logger.info(`Backup created: ${backupPath}`);
    
    return { success: true, backupPath };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logger.error(`Backup failed: ${message}`);
    return { success: false, error: message };
  }
}

export async function logChange(
  logPath: string,
  entry: ChangeLogEntry
): Promise<void> {
  try {
    await ensureDir(join(logPath, '..'));
    
    const logEntry = `\n## ${entry.timestamp}\n\n- **File Modified**: ${entry.file}\n- **Change**: ${entry.change}\n`;
    
    let existing = '';
    try {
      existing = await safeReadFile(logPath);
    } catch {
      existing = '# TELOS Change Log\n\nAutomatic log of all TELOS file modifications.\n';
    }
    
    await safeWriteFile(logPath, existing + logEntry);
  } catch (error) {
    await logger.error(`Change log failed: ${error}`);
  }
}
