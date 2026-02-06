#!/usr/bin/env bun

import { MemoryVectraClient } from '../lib/vectraClient';
import { join } from 'path';

const HOME = process.env.HOME || '';
const INDEX_PATH = process.env.KIRO_MEMORY_PATH || join(HOME, '.kiro/memory/vectra');
const REGION = process.env.AWS_REGION || 'us-east-2';

async function main() {
  const query = process.argv[2];
  const limit = parseInt(process.argv[3] || '5');
  
  if (!query) {
    console.log('Usage: bun tools/query-memory.ts "your query" [limit]');
    console.log('Example: bun tools/query-memory.ts "authentication bugs" 3');
    process.exit(1);
  }
  
  const client = new MemoryVectraClient({
    indexPath: INDEX_PATH,
    region: REGION
  });
  
  console.log(`🔍 Searching memory for: "${query}"\n`);
  
  const results = await client.query({ query, limit });
  
  if (results.length === 0) {
    console.log('No results found.');
    return;
  }
  
  console.log(`Found ${results.length} result(s):\n`);
  
  results.forEach((result, i) => {
    console.log(`${i + 1}. ${result.task}`);
    console.log(`   Similarity: ${(result.similarity * 100).toFixed(1)}%`);
    console.log(`   Outcome: ${result.outcome}`);
    console.log(`   Sentiment: ${result.sentiment || 'N/A'}`);
    console.log(`   Files: ${result.files.length > 0 ? result.files.join(', ') : 'None'}`);
    console.log(`   Time: ${new Date(result.timestamp).toLocaleString()}`);
    console.log();
  });
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
