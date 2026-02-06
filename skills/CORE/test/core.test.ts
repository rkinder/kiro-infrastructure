import { describe, test, expect, beforeEach } from 'bun:test';
import { CoreSkill } from '../core';

describe('CoreSkill Foundation', () => {
  let core: CoreSkill;
  
  beforeEach(() => {
    core = new CoreSkill();
  });
  
  test('initializes successfully', async () => {
    await core.initialize();
    expect(core.isInitialized()).toBe(true);
  });
  
  test('initialization completes within 2 seconds', async () => {
    const start = Date.now();
    await core.initialize();
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(2000);
  });
  
  test('initialization is idempotent', async () => {
    await core.initialize();
    await core.initialize();
    await core.initialize();
    
    expect(core.isInitialized()).toBe(true);
  });
  
  test('provides context access', async () => {
    await core.initialize();
    const context = core.getContext();
    
    expect(context).toBeDefined();
  });
  
  test('handles missing TELOS gracefully', async () => {
    const core = new CoreSkill({
      telosPath: '/nonexistent/path'
    });
    
    // Should not throw
    await core.initialize();
    expect(core.isInitialized()).toBe(true);
  });
});
