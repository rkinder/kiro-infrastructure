#!/usr/bin/env bun

import { MemoryVectraClient } from '../lib/vectraClient';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const HOME = process.env.HOME || '';
const INDEX_PATH = process.env.KIRO_MEMORY_PATH || join(HOME, '.kiro/memory/vectra');
const JOURNAL_PATH = process.env.KIRO_JOURNAL_PATH || join(HOME, '.kiro/journals');
const REGION = process.env.AWS_REGION || 'us-east-2';

async function main() {
  const sessionId = process.argv[2];
  const rating = parseInt(process.argv[3]);
  
  if (!sessionId || isNaN(rating) || rating < 1 || rating > 5) {
    console.log('Usage: bun tools/rate-memory.ts <session-id> <rating>');
    console.log('  session-id: Session identifier (e.g., 2026-02-06T09:30:00Z)');
    console.log('  rating: 1-5 stars');
    console.log('\nExample: bun tools/rate-memory.ts 2026-02-06T09:30:00Z 5');
    process.exit(1);
  }
  
  const client = new MemoryVectraClient({
    indexPath: INDEX_PATH,
    region: REGION
  });
  
  // Query to find the entry
  const results = await client.query({
    query: sessionId,
    limit: 10
  });
  
  const entry = results.find(r => r.session_id.includes(sessionId));
  
  if (!entry) {
    console.log(`❌ Session not found: ${sessionId}`);
    console.log('\nAvailable sessions:');
    results.slice(0, 5).forEach(r => {
      console.log(`  - ${r.session_id}: ${r.task}`);
    });
    process.exit(1);
  }
  
  console.log(`⭐ Rating session: ${entry.task}`);
  console.log(`   Rating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)} (${rating}/5)`);
  
  // Update journal file with rating
  const date = sessionId.split('T')[0];
  const journalFile = join(JOURNAL_PATH, `${date}.md`);
  
  try {
    let content = readFileSync(journalFile, 'utf-8');
    
    // Find the entry and add rating
    const taskLine = entry.task;
    const ratingLine = `\n**Rating**: ${'⭐'.repeat(rating)}\n`;
    
    // Insert rating after outcome if not already present
    if (!content.includes('**Rating**')) {
      content = content.replace(
        new RegExp(`(\\*\\*Outcome\\*\\*: [^\\n]+)`, 'g'),
        `$1${ratingLine}`
      );
      
      writeFileSync(journalFile, content);
      console.log(`✅ Rating saved to journal: ${journalFile}`);
    } else {
      console.log('⚠️  Rating already exists in journal');
    }
  } catch (error) {
    console.log(`⚠️  Could not update journal file: ${(error as Error).message}`);
  }
  
  console.log('\n💡 Note: Re-process journals to update memory index with rating');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
