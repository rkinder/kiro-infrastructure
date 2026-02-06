import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { JournalProcessor } from '../lib/journalProcessor';
import { MemoryVectraClient } from '../lib/vectraClient';
import { rmSync } from 'fs';
import { join } from 'path';

const TEST_INDEX = '/tmp/kiro-memory-processor-test';
const TEST_JOURNAL_PATH = join(__dirname, 'fixtures');
const TEST_REGION = process.env.AWS_REGION || 'us-east-2';

describe('Journal Processor', () => {
  let processor: JournalProcessor;
  let client: MemoryVectraClient;
  
  beforeAll(async () => {
    rmSync(TEST_INDEX, { recursive: true, force: true });
    
    processor = new JournalProcessor({
      journalPath: TEST_JOURNAL_PATH,
      indexPath: TEST_INDEX,
      region: TEST_REGION
    });
    
    await processor.initialize();
    
    client = new MemoryVectraClient({
      indexPath: TEST_INDEX,
      region: TEST_REGION
    });
  });
  
  afterAll(() => {
    rmSync(TEST_INDEX, { recursive: true, force: true });
  });
  
  test('should process journal file', async () => {
    const journalFile = join(TEST_JOURNAL_PATH, '2026-02-06.md');
    const count = await processor.processJournal(journalFile);
    
    expect(count).toBe(3);
    
    const totalCount = await client.count();
    expect(totalCount).toBe(3);
  });
  
  test('should query processed entries', async () => {
    const results = await client.query({
      query: 'authentication login issues',
      limit: 5
    });
    
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    
    const authEntry = results.find(r => r.task.includes('authentication'));
    expect(authEntry).toBeDefined();
    expect(authEntry?.sentiment).toBeDefined();
  });
  
  test('should find caching related work', async () => {
    const results = await client.query({
      query: 'performance optimization caching',
      limit: 2
    });
    
    expect(results.length).toBeGreaterThan(0);
    const cachingEntry = results.find(r => r.task.includes('caching'));
    expect(cachingEntry).toBeDefined();
  });
});
