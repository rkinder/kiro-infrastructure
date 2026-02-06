import { describe, test, expect } from 'bun:test';
import { parseJournal } from '../lib/journalParser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Journal Parser', () => {
  test('should parse journal entries', () => {
    const content = readFileSync(
      join(__dirname, 'fixtures/2026-02-06.md'),
      'utf-8'
    );
    
    const entries = parseJournal(content, '2026-02-06');
    
    expect(entries.length).toBe(3);
    
    expect(entries[0].task).toBe('Fixed authentication bug in login flow');
    expect(entries[0].outcome).toContain('Successfully resolved');
    expect(entries[0].files.length).toBe(3);
    expect(entries[0].files[0]).toBe('src/auth/validator.ts');
    expect(entries[0].timestamp).toBe('2026-02-06T09:30:00Z');
    
    expect(entries[1].task).toBe('Implemented user profile caching');
    expect(entries[1].files.length).toBe(3);
    
    expect(entries[2].task).toBe('Refactored database connection pool');
    expect(entries[2].files.length).toBe(2);
  });
  
  test('should handle empty journal', () => {
    const entries = parseJournal('# Work Journal - 2026-02-06\n\n', '2026-02-06');
    expect(entries.length).toBe(0);
  });
  
  test('should handle entry without files', () => {
    const content = `# Work Journal - 2026-02-06

## 10:00:00 - Code review

**Outcome**: Reviewed PR #123

---
`;
    
    const entries = parseJournal(content, '2026-02-06');
    expect(entries.length).toBe(1);
    expect(entries[0].files.length).toBe(0);
  });
});
