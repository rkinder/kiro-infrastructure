import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { JournalProcessor } from '../lib/journalProcessor';
import { MemoryAPI } from '../lib/memoryAPI';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const TEST_DIR = '/tmp/kiro-e2e-test';
const JOURNAL_PATH = join(TEST_DIR, 'journals');
const INDEX_PATH = join(TEST_DIR, 'memory');
const REGION = process.env.AWS_REGION || 'us-east-2';

describe('End-to-End Integration', () => {
  beforeAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(JOURNAL_PATH, { recursive: true });
    
    // Create test journals
    const journal1 = `# Work Journal - 2026-02-01

## 09:00:00 - Implemented OAuth2 authentication

**Outcome**: Successfully integrated OAuth2 flow with Google and GitHub providers. Users can now sign in with social accounts.

**Files Modified**:
- src/auth/oauth.ts
- src/auth/providers/google.ts
- src/auth/providers/github.ts

---

## 14:30:00 - Fixed memory leak in WebSocket connections

**Outcome**: Identified and resolved memory leak caused by unclosed connections. Memory usage now stable.

**Files Modified**:
- src/websocket/connection.ts
- src/websocket/pool.ts

---
`;

    const journal2 = `# Work Journal - 2026-02-02

## 10:15:00 - Added Redis caching for API responses

**Outcome**: Implemented Redis caching layer. API response time reduced by 75%. Cache hit rate at 85%.

**Files Modified**:
- src/cache/redis.ts
- src/api/middleware/cache.ts

---

## 16:00:00 - Deployed to production

**Outcome**: Successfully deployed v2.1.0 to production. All health checks passing. Zero downtime deployment.

**Files Modified**:
- deploy/production.yml
- CHANGELOG.md

---
`;

    writeFileSync(join(JOURNAL_PATH, '2026-02-01.md'), journal1);
    writeFileSync(join(JOURNAL_PATH, '2026-02-02.md'), journal2);
  });
  
  afterAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('complete workflow: process → query → stats', async () => {
    // Step 1: Process journals
    const processor = new JournalProcessor({
      journalPath: JOURNAL_PATH,
      indexPath: INDEX_PATH,
      region: REGION
    });
    
    await processor.initialize();
    const result = await processor.processAllJournals();
    
    expect(result.processed).toBe(2);
    expect(result.entries).toBe(4);
    
    // Step 2: Query memory
    const api = new MemoryAPI({
      indexPath: INDEX_PATH,
      region: REGION
    });
    
    const authResults = await api.query('authentication OAuth', 3);
    expect(authResults.length).toBeGreaterThan(0);
    
    const authEntry = authResults.find(r => r.task.includes('OAuth'));
    expect(authEntry).toBeDefined();
    expect(authEntry?.files.length).toBeGreaterThan(0);
    
    // Step 3: Query by different topics
    const cacheResults = await api.query('caching performance', 2);
    expect(cacheResults.length).toBeGreaterThan(0);
    
    const memoryResults = await api.query('memory leak', 2);
    expect(memoryResults.length).toBeGreaterThan(0);
    
    // Step 4: Get stats
    const stats = await api.getStats();
    expect(stats.total).toBe(4);
  }, 30000); // 30s timeout for Bedrock calls
  
  test('semantic similarity ranking', async () => {
    const api = new MemoryAPI({
      indexPath: INDEX_PATH,
      region: REGION
    });
    
    const results = await api.query('OAuth social login authentication', 3);
    
    // First result should be most relevant (OAuth task)
    expect(results[0].task).toContain('OAuth');
    expect(results[0].similarity).toBeGreaterThan(0.2);
    
    // Results should be sorted by similarity
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].similarity).toBeGreaterThanOrEqual(results[i].similarity);
    }
  }, 10000);
  
  test('handles multiple file references', async () => {
    const api = new MemoryAPI({
      indexPath: INDEX_PATH,
      region: REGION
    });
    
    const results = await api.query('OAuth authentication', 1);
    const oauthEntry = results.find(r => r.task.includes('OAuth'));
    
    expect(oauthEntry?.files.length).toBe(3);
    expect(oauthEntry?.files).toContain('src/auth/oauth.ts');
  }, 10000);
});
