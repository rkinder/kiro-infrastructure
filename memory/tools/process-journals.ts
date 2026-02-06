#!/usr/bin/env bun

import { JournalProcessor } from '../lib/journalProcessor';
import { join } from 'path';

const HOME = process.env.HOME || '';
const JOURNAL_PATH = process.env.KIRO_JOURNAL_PATH || join(HOME, '.kiro/journals');
const INDEX_PATH = process.env.KIRO_MEMORY_PATH || join(HOME, '.kiro/memory/vectra');
const REGION = process.env.AWS_REGION || 'us-east-2';

async function main() {
  console.log('🧠 Kiro Memory System - Journal Processor\n');
  console.log(`Journal Path: ${JOURNAL_PATH}`);
  console.log(`Index Path: ${INDEX_PATH}`);
  console.log(`AWS Region: ${REGION}\n`);
  
  const processor = new JournalProcessor({
    journalPath: JOURNAL_PATH,
    indexPath: INDEX_PATH,
    region: REGION
  });
  
  console.log('Initializing Vectra index...');
  await processor.initialize();
  
  console.log('Processing journals...');
  const start = Date.now();
  
  const result = await processor.processAllJournals();
  
  const duration = ((Date.now() - start) / 1000).toFixed(2);
  
  console.log(`\n✅ Complete!`);
  console.log(`   Files processed: ${result.processed}`);
  console.log(`   Entries indexed: ${result.entries}`);
  console.log(`   Duration: ${duration}s`);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
