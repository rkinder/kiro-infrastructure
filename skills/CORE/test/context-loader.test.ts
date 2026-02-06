import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { TelosContextLoader } from '../context-loader';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const TEST_DIR = '/tmp/telos-test';

describe('TelosContextLoader', () => {
  beforeAll(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    
    // Create test TELOS files
    writeFileSync(join(TEST_DIR, 'MISSION.md'), `
# Mission

Build innovative AI systems that enhance human capabilities.
`);
    
    writeFileSync(join(TEST_DIR, 'BELIEFS.md'), `
# Beliefs

- Simplicity is powerful
- Test everything
- Documentation matters
`);
    
    writeFileSync(join(TEST_DIR, 'GOALS.md'), `
# Goals

1. Complete v0.4 CORE skill
2. Implement TELOS integration
3. Deploy to production
`);
    
    writeFileSync(join(TEST_DIR, 'PREFERENCES.md'), `
# Preferences

Prefer TypeScript over JavaScript.
Use minimal dependencies.
`);
  });
  
  afterAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('loads TELOS context successfully', async () => {
    const loader = new TelosContextLoader(TEST_DIR);
    const context = await loader.load();
    
    expect(context.mission).toBeDefined();
    expect(context.beliefs).toBeDefined();
    expect(context.goals).toBeDefined();
  });
  
  test('extracts mission text', async () => {
    const loader = new TelosContextLoader(TEST_DIR);
    const context = await loader.load();
    
    expect(context.mission).toContain('Build innovative AI systems');
  });
  
  test('extracts beliefs as list', async () => {
    const loader = new TelosContextLoader(TEST_DIR);
    const context = await loader.load();
    
    expect(context.beliefs?.length).toBe(3);
    expect(context.beliefs?.[0]).toBe('Simplicity is powerful');
  });
  
  test('extracts goals as list', async () => {
    const loader = new TelosContextLoader(TEST_DIR);
    const context = await loader.load();
    
    expect(context.goals?.length).toBe(3);
    expect(context.goals?.[0]).toContain('v0.4 CORE skill');
  });
  
  test('stores other files as preferences', async () => {
    const loader = new TelosContextLoader(TEST_DIR);
    const context = await loader.load();
    
    expect(context.preferences?.preferences).toBeDefined();
    expect(context.preferences?.preferences).toContain('TypeScript');
  });
  
  test('handles missing TELOS directory gracefully', async () => {
    const loader = new TelosContextLoader('/nonexistent/path');
    const context = await loader.load();
    
    expect(context).toBeDefined();
    expect(Object.keys(context).length).toBe(0);
  });
  
  test('handles corrupted files gracefully', async () => {
    const corruptDir = join(TEST_DIR, 'corrupt');
    mkdirSync(corruptDir, { recursive: true });
    
    // Create a file that will cause parsing issues
    writeFileSync(join(corruptDir, 'BROKEN.md'), '\x00\x01\x02');
    
    const loader = new TelosContextLoader(corruptDir);
    const context = await loader.load();
    
    // Should not throw, returns partial context
    expect(context).toBeDefined();
  });
  
  test('completes within timeout', async () => {
    const loader = new TelosContextLoader(TEST_DIR);
    
    const start = Date.now();
    await loader.load();
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000); // 1 second timeout
  });
});
