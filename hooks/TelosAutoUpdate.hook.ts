#!/usr/bin/env bun

import { BaseHook, parseInput } from './lib/base';
import { loadConfig } from './lib/config';
import { createBackup, logChange } from './lib/backup';
import { logger } from './lib/logger';
import type { HookOutput } from './lib/types';
import { join } from 'path';

class TelosAutoUpdateHook extends BaseHook {
  async execute(): Promise<HookOutput> {
    const config = await loadConfig();
    const telosPath = config.telos_path.replace('~', process.env.HOME || '');
    
    const filePath = this.input.file_path as string;
    const changeDescription = this.input.change_description as string || 'File modified';
    
    if (!filePath || !this.isTelosFile(filePath, telosPath)) {
      return { continue: true };
    }
    
    const backupDir = join(config.backup_path.replace('~', process.env.HOME || ''), 'telos');
    const result = await createBackup(filePath, backupDir);
    
    if (result.success) {
      const logPath = join(telosPath, 'updates.md');
      await logChange(logPath, {
        timestamp: new Date().toISOString(),
        file: filePath.split('/').pop() || filePath,
        change: changeDescription
      });
      
      await logger.info(`TELOS file backed up: ${filePath}`);
      return { 
        continue: true, 
        message: `Backup created: ${result.backupPath}`,
        data: { backupPath: result.backupPath }
      };
    }
    
    return { continue: true, message: 'Backup failed but continuing' };
  }
  
  private isTelosFile(filePath: string, telosPath: string): boolean {
    return filePath.startsWith(telosPath) && filePath.endsWith('.md');
  }
}

const input = parseInput();
const hook = new TelosAutoUpdateHook(input);
const result = await hook.execute();
console.log(JSON.stringify(result));
