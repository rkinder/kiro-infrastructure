import { MemoryVectraClient } from './vectraClient';
import { parseJournal, type JournalEntry } from './journalParser';
import { analyzeSentiment } from './sentiment';
import type { MemoryEntry } from './types';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export interface ProcessorConfig {
  journalPath: string;
  indexPath: string;
  region: string;
}

export class JournalProcessor {
  private client: MemoryVectraClient;
  
  constructor(private config: ProcessorConfig) {
    this.client = new MemoryVectraClient({
      indexPath: config.indexPath,
      region: config.region
    });
  }
  
  async initialize(): Promise<void> {
    await this.client.initialize();
  }
  
  async processJournal(filePath: string): Promise<number> {
    const content = readFileSync(filePath, 'utf-8');
    const date = filePath.match(/(\d{4}-\d{2}-\d{2})\.md$/)?.[1];
    
    if (!date) {
      throw new Error(`Invalid journal filename: ${filePath}`);
    }
    
    const entries = parseJournal(content, date);
    
    for (const entry of entries) {
      await this.indexEntry(entry);
    }
    
    return entries.length;
  }
  
  async processAllJournals(): Promise<{ processed: number; entries: number }> {
    const files = readdirSync(this.config.journalPath)
      .filter(f => f.endsWith('.md'))
      .map(f => join(this.config.journalPath, f));
    
    let totalEntries = 0;
    
    for (const file of files) {
      const count = await this.processJournal(file);
      totalEntries += count;
    }
    
    return { processed: files.length, entries: totalEntries };
  }
  
  private async indexEntry(entry: JournalEntry): Promise<void> {
    const document = this.formatDocument(entry);
    const sentiment = analyzeSentiment(entry.outcome);
    
    const memoryEntry: MemoryEntry = {
      session_id: `${entry.date}-${entry.timestamp}`,
      document,
      metadata: {
        timestamp: entry.timestamp,
        task: entry.task,
        outcome: entry.outcome,
        files: entry.files,
        sentiment: sentiment.label,
        sentiment_score: sentiment.score
      }
    };
    
    await this.client.addEntry(memoryEntry);
  }
  
  private formatDocument(entry: JournalEntry): string {
    let doc = `Task: ${entry.task}\n`;
    doc += `Outcome: ${entry.outcome}\n`;
    
    if (entry.files.length > 0) {
      doc += `Files: ${entry.files.join(', ')}`;
    }
    
    return doc;
  }
}
