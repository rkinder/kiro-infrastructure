import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { MemoryAPI } from '../lib/memoryAPI';
import { JournalProcessor } from '../lib/journalProcessor';
import { rmSync } from 'fs';
import { join } from 'path';

const TEST_INDEX = '/tmp/kiro-memory-api-test';
const TEST_JOURNAL_PATH = join(__dirname, 'fixtures');
const TEST_REGION = process.env.AWS_REGION || 'us-east-2';

describe('Memory API', () => {
  let api: MemoryAPI;
  
  beforeAll(async () => {
    rmSync(TEST_INDEX, { recursive: true, force: true });
    
    // Index test data
    const processor = new JournalProcessor({
      journalPath: TEST_JOURNAL_PATH,
      indexPath: TEST_INDEX,
      region: TEST_REGION
    });
    await processor.initialize();
    await processor.processAllJournals();
    
    // Create API
    api = new MemoryAPI({
      indexPath: TEST_INDEX,
      region: TEST_REGION
    });
  });
  
  afterAll(() => {
    rmSync(TEST_INDEX, { recursive: true, force: true });
  });
  
  test('should query similar work', async () => {
    const results = await api.querySimilarWork('authentication', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].task).toContain('authentication');
  });
  
  test('should get stats', async () => {
    const stats = await api.getStats();
    expect(stats.total).toBe(3);
  });
  
  test('should query by general search', async () => {
    const results = await api.query('caching performance', 5);
    expect(results.length).toBeGreaterThan(0);
  });
});
