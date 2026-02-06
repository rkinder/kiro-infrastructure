#!/usr/bin/env bun

import { JournalProcessor } from '../lib/journalProcessor';
import { MemoryAPI } from '../lib/memoryAPI';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const TEST_DIR = '/tmp/kiro-benchmark';
const JOURNAL_PATH = join(TEST_DIR, 'journals');
const INDEX_PATH = join(TEST_DIR, 'memory');
const REGION = process.env.AWS_REGION || 'us-east-2';

function generateJournal(date: string, entryCount: number): string {
  let content = `# Work Journal - ${date}\n\n`;
  
  for (let i = 0; i < entryCount; i++) {
    const hour = 9 + Math.floor(i * 2);
    const minute = (i % 2) * 30;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    
    content += `## ${time} - Task ${i + 1}: Implemented feature ${i + 1}\n\n`;
    content += `**Outcome**: Successfully completed feature ${i + 1}. All tests passing.\n\n`;
    content += `**Files Modified**:\n`;
    content += `- src/feature${i + 1}/main.ts\n`;
    content += `- src/feature${i + 1}/test.ts\n\n`;
    content += `---\n\n`;
  }
  
  return content;
}

async function benchmark() {
  console.log('🔬 Kiro Memory System - Performance Benchmark\n');
  
  // Setup
  rmSync(TEST_DIR, { recursive: true, force: true });
  mkdirSync(JOURNAL_PATH, { recursive: true });
  
  const entriesPerJournal = 5;
  const journalCount = 3;
  const totalEntries = entriesPerJournal * journalCount;
  
  console.log(`Generating ${journalCount} journals with ${entriesPerJournal} entries each...`);
  
  for (let i = 0; i < journalCount; i++) {
    const date = `2026-02-${(i + 1).toString().padStart(2, '0')}`;
    const content = generateJournal(date, entriesPerJournal);
    writeFileSync(join(JOURNAL_PATH, `${date}.md`), content);
  }
  
  // Benchmark: Processing
  console.log('\n📊 Benchmark 1: Journal Processing');
  const processor = new JournalProcessor({
    journalPath: JOURNAL_PATH,
    indexPath: INDEX_PATH,
    region: REGION
  });
  
  await processor.initialize();
  
  const processStart = Date.now();
  const result = await processor.processAllJournals();
  const processDuration = Date.now() - processStart;
  
  console.log(`   Entries processed: ${result.entries}`);
  console.log(`   Total time: ${processDuration}ms`);
  console.log(`   Time per entry: ${(processDuration / result.entries).toFixed(0)}ms`);
  console.log(`   Throughput: ${(result.entries / (processDuration / 1000)).toFixed(2)} entries/sec`);
  
  // Benchmark: Querying
  console.log('\n📊 Benchmark 2: Query Performance');
  const api = new MemoryAPI({
    indexPath: INDEX_PATH,
    region: REGION
  });
  
  const queries = [
    'feature implementation',
    'testing completed',
    'file modifications'
  ];
  
  let totalQueryTime = 0;
  
  for (const query of queries) {
    const queryStart = Date.now();
    const results = await api.query(query, 5);
    const queryDuration = Date.now() - queryStart;
    totalQueryTime += queryDuration;
    
    console.log(`   Query: "${query}"`);
    console.log(`   Time: ${queryDuration}ms`);
    console.log(`   Results: ${results.length}`);
  }
  
  const avgQueryTime = totalQueryTime / queries.length;
  console.log(`\n   Average query time: ${avgQueryTime.toFixed(0)}ms`);
  
  // Benchmark: Stats
  console.log('\n📊 Benchmark 3: Stats Performance');
  const statsStart = Date.now();
  const stats = await api.getStats();
  const statsDuration = Date.now() - statsStart;
  
  console.log(`   Total entries: ${stats.total}`);
  console.log(`   Time: ${statsDuration}ms`);
  
  // Summary
  console.log('\n📈 Summary');
  console.log(`   Processing: ${(processDuration / result.entries).toFixed(0)}ms per entry`);
  console.log(`   Querying: ${avgQueryTime.toFixed(0)}ms average`);
  console.log(`   Stats: ${statsDuration}ms`);
  
  // Cost estimate
  const costPerEntry = 0.00001; // $0.01 per 1000 entries
  const costPerQuery = 0.00001;
  const totalCost = (result.entries * costPerEntry) + (queries.length * costPerQuery);
  
  console.log(`\n💰 Cost Estimate`);
  console.log(`   Indexing: $${(result.entries * costPerEntry).toFixed(6)}`);
  console.log(`   Queries: $${(queries.length * costPerQuery).toFixed(6)}`);
  console.log(`   Total: $${totalCost.toFixed(6)}`);
  
  // Cleanup
  rmSync(TEST_DIR, { recursive: true, force: true });
  
  console.log('\n✅ Benchmark complete!');
}

benchmark().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
