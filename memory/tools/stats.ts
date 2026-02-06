#!/usr/bin/env bun

import { MemoryAPI } from '../lib/memoryAPI';
import { join } from 'path';

const HOME = process.env.HOME || '';
const INDEX_PATH = process.env.KIRO_MEMORY_PATH || join(HOME, '.kiro/memory/vectra');
const REGION = process.env.AWS_REGION || 'us-east-2';

async function main() {
  const api = new MemoryAPI({
    indexPath: INDEX_PATH,
    region: REGION
  });
  
  console.log('📊 Kiro Memory System - Statistics\n');
  
  const stats = await api.getStats();
  
  console.log(`Total Entries: ${stats.total}`);
  
  if (stats.total === 0) {
    console.log('\n💡 No entries found. Run process-journals.ts to index your work.');
    return;
  }
  
  // Get recent work (use generic query)
  console.log('\n📈 Recent Work:');
  const recent = await api.query('work task completed', 5);
  recent.forEach((entry, i) => {
    const sentiment = entry.sentiment || 'neutral';
    const icon = sentiment === 'positive' ? '✅' : sentiment === 'negative' ? '❌' : '➖';
    console.log(`  ${i + 1}. ${icon} ${entry.task}`);
    console.log(`     ${new Date(entry.timestamp).toLocaleDateString()}`);
  });
  
  console.log('\n💡 Use query-memory.ts to search your work history');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
