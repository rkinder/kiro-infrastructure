import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { MemoryVectraClient } from '../lib/vectraClient';
import { rmSync } from 'fs';

const TEST_INDEX = '/tmp/kiro-memory-test';
const TEST_REGION = process.env.AWS_REGION || 'us-east-1';

describe('MemoryVectraClient', () => {
  let client: MemoryVectraClient;
  
  beforeAll(async () => {
    rmSync(TEST_INDEX, { recursive: true, force: true });
    client = new MemoryVectraClient({
      indexPath: TEST_INDEX,
      region: TEST_REGION
    });
    await client.initialize();
  });
  
  afterAll(() => {
    rmSync(TEST_INDEX, { recursive: true, force: true });
  });
  
  test('should add and query entries', async () => {
    await client.addEntry({
      session_id: 'test-1',
      document: 'Fixed authentication bug in login flow',
      metadata: {
        timestamp: '2026-02-06T14:00:00Z',
        task: 'Bug fix',
        outcome: 'success',
        files: ['auth.ts'],
        rating: 5,
        sentiment: 'positive'
      }
    });
    
    const results = await client.query({
      query: 'authentication issues',
      limit: 1
    });
    
    expect(results.length).toBe(1);
    expect(results[0].session_id).toBe('test-1');
    expect(results[0].task).toBe('Bug fix');
    expect(results[0].similarity).toBeGreaterThan(0);
  });
  
  test('should count entries', async () => {
    const count = await client.count();
    expect(count).toBeGreaterThan(0);
  });
});
