import { test, expect, describe } from 'bun:test';
import { generateTitle, truncateTitle } from '../lib/terminal';

describe('UpdateTabTitle Hook - Property Tests', () => {
  test('determinism: same context produces same title', () => {
    const context = { project: 'kiro-infrastructure', task: 'implement hooks', agent: 'default' };
    
    const title1 = generateTitle(context);
    const title2 = generateTitle(context);
    
    expect(title1).toBe(title2);
  });
  
  test('length constraints: titles are within limits', () => {
    const longContext = {
      project: 'very-long-project-name-that-exceeds-normal-limits',
      task: 'implementing-a-very-complex-feature-with-many-details',
      agent: 'specialized-agent-with-long-name'
    };
    
    const title = generateTitle(longContext);
    const truncated = truncateTitle(title, 80);
    
    expect(truncated.length).toBeLessThanOrEqual(80);
  });
  
  test('format consistency: title follows expected pattern', () => {
    const context = { project: 'test-project', task: 'test-task' };
    const title = generateTitle(context);
    
    expect(title).toContain('Kiro');
    expect(title).toContain('test-project');
    expect(title).toContain('test-task');
    expect(title).toMatch(/Kiro - .+ - .+/);
  });
  
  test('truncation preserves readability', () => {
    const longTitle = 'A'.repeat(100);
    const truncated = truncateTitle(longTitle, 50);
    
    expect(truncated).toEndWith('...');
    expect(truncated.length).toBe(50);
  });
});
