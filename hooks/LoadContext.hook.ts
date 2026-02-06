#!/usr/bin/env bun

import { BaseHook, parseInput } from './lib/base';
import { loadConfig } from './lib/config';
import { listFiles, safeReadFile } from './lib/fs';
import { withAsyncErrorHandling } from './lib/errors';
import { logger } from './lib/logger';
import type { HookOutput, TelosFile } from './lib/types';
import { join } from 'path';

class LoadContextHook extends BaseHook {
  async execute(): Promise<HookOutput> {
    const config = await loadConfig();
    const telosPath = config.telos_path.replace('~', process.env.HOME || '');
    
    const context = await withAsyncErrorHandling(
      async () => await this.loadTelosContext(telosPath),
      '',
      true
    );
    
    if (!context) {
      await logger.warn('Failed to load TELOS context');
      return { continue: true, message: 'TELOS context unavailable' };
    }
    
    await logger.info('TELOS context loaded successfully');
    return { continue: true, data: context };
  }
  
  private async loadTelosContext(telosPath: string): Promise<string> {
    const files = await this.scanTelosFiles(telosPath);
    const loaded = await this.loadFiles(files);
    return this.formatContext(loaded);
  }
  
  private async scanTelosFiles(dir: string): Promise<string[]> {
    const files = await listFiles(dir, '.md');
    return files.map(file => join(dir, file));
  }
  
  private async loadFiles(paths: string[]): Promise<TelosFile[]> {
    const results: TelosFile[] = [];
    
    for (const path of paths) {
      try {
        const content = await safeReadFile(path);
        const name = path.split('/').pop() || path;
        results.push({ path, name, content });
      } catch (error) {
        await logger.warn(`Failed to load ${path}: ${error}`);
      }
    }
    
    return results;
  }
  
  private formatContext(files: TelosFile[]): string {
    const sections = files.map(file => 
      `--- ${file.name.replace('.md', '').toUpperCase()} ---\n${file.content}`
    );
    
    return `# TELOS Context\n\n${sections.join('\n\n')}`;
  }
}

const input = parseInput();
const hook = new LoadContextHook(input);
const result = await hook.execute();

// For agentSpawn hooks, output context directly to STDOUT
// Kiro adds STDOUT to agent context when exit code is 0
if (result.data) {
  console.log(result.data);
  process.exit(0);
} else {
  console.error(result.message || 'Failed to load TELOS context');
  process.exit(1);
}
