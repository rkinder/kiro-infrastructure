import { test, expect, describe } from 'bun:test';
import { matchPattern, SECURITY_PATTERNS } from '../lib/patterns';

describe('SecurityValidator Hook - Property Tests', () => {
  test('consistency: same command produces same decision', () => {
    const testCommands = [
      'git push --force',
      'rm -rf ~',
      'sudo apt update',
      'ls -la'
    ];
    
    for (const cmd of testCommands) {
      const result1 = matchPattern(cmd);
      const result2 = matchPattern(cmd);
      
      expect(result1?.level).toBe(result2?.level);
      expect(result1?.message).toBe(result2?.message);
    }
  });
  
  test('security: dangerous patterns are never silently allowed', () => {
    const dangerousCommands = [
      'git push --force',
      'sudo rm -rf /',
      'chmod 777 /etc/passwd'
    ];
    
    for (const cmd of dangerousCommands) {
      const result = matchPattern(cmd);
      expect(result).not.toBeNull();
      expect(result?.level).not.toBe('allow');
    }
  });
  
  test('passthrough: safe commands have no restrictions', () => {
    const safeCommands = [
      'ls -la',
      'cat file.txt',
      'echo "hello"',
      'cd /home/user'
    ];
    
    for (const cmd of safeCommands) {
      const result = matchPattern(cmd);
      expect(result).toBeNull();
    }
  });
  
  test('coverage: all pattern levels are represented', () => {
    const levels = new Set(SECURITY_PATTERNS.map(p => p.level));
    
    expect(levels.has('block')).toBe(true);
    expect(levels.has('confirm')).toBe(true);
    expect(levels.has('alert')).toBe(true);
  });
});
