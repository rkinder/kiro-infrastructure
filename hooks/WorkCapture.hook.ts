#!/usr/bin/env bun

import { BaseHook, parseInput } from './lib/base';
import { loadConfig } from './lib/config';
import { ensureDir, safeWriteFile, safeReadFile } from './lib/fs';
import { logger } from './lib/logger';
import type { HookOutput } from './lib/types';
import { join } from 'path';

interface WorkEntry {
  timestamp: string;
  session_id: string;
  task: string;
  outcome: string;
  files_modified?: string[];
}

class WorkCaptureHook extends BaseHook {
  async execute(): Promise<HookOutput> {
    const config = await loadConfig();
    const journalPath = config.journal_path.replace('~', process.env.HOME || '');
    
    const task = this.input.task as string;
    const outcome = this.input.outcome as string;
    const filesModified = this.input.files_modified as string[] | undefined;
    
    if (!task || !outcome) {
      return { continue: true };
    }
    
    const entry: WorkEntry = {
      timestamp: new Date().toISOString(),
      session_id: this.input.session_id,
      task,
      outcome,
      files_modified: filesModified
    };
    
    await this.captureWork(journalPath, entry);
    await logger.info(`Work captured: ${task}`);
    
    return { continue: true, message: 'Work logged successfully' };
  }
  
  private async captureWork(journalPath: string, entry: WorkEntry): Promise<void> {
    await ensureDir(journalPath);
    
    const date = new Date().toISOString().split('T')[0];
    const journalFile = join(journalPath, `${date}.md`);
    
    let existing = '';
    try {
      existing = await safeReadFile(journalFile);
    } catch {
      existing = `# Work Journal - ${date}\n\n`;
    }
    
    const entryText = this.formatEntry(entry);
    await safeWriteFile(journalFile, existing + entryText);
  }
  
  private formatEntry(entry: WorkEntry): string {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    let text = `## ${time} - ${entry.task}\n\n`;
    text += `**Outcome**: ${entry.outcome}\n\n`;
    
    if (entry.files_modified && entry.files_modified.length > 0) {
      text += `**Files Modified**:\n`;
      entry.files_modified.forEach(file => {
        text += `- ${file}\n`;
      });
      text += '\n';
    }
    
    text += '---\n\n';
    return text;
  }
}

const input = parseInput();
const hook = new WorkCaptureHook(input);
const result = await hook.execute();
console.log(JSON.stringify(result));
