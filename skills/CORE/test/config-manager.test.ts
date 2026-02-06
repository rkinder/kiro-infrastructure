import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { ConfigManager } from '../config-manager';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const TEST_DIR = '/tmp/core-config-test';
const SYSTEM_CONFIG = join(TEST_DIR, 'system.yaml');
const USER_CONFIG = join(TEST_DIR, 'user.yaml');

describe('ConfigManager', () => {
  beforeAll(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    
    // Create system config
    writeFileSync(SYSTEM_CONFIG, `
responseFormat:
  voiceWordLimit: 150
  includeStoryExplanation: true

telos:
  autoLoad: true
  required: false
`);
  });
  
  afterAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });
  
  test('loads system defaults', () => {
    const manager = new ConfigManager(SYSTEM_CONFIG, USER_CONFIG);
    const config = manager.load();
    
    expect(config.responseFormat.voiceWordLimit).toBe(150);
    expect(config.telos.autoLoad).toBe(true);
  });
  
  test('user config overrides system defaults', () => {
    writeFileSync(USER_CONFIG, `
responseFormat:
  voiceWordLimit: 200
`);
    
    const manager = new ConfigManager(SYSTEM_CONFIG, USER_CONFIG);
    const config = manager.load();
    
    expect(config.responseFormat.voiceWordLimit).toBe(200);
    expect(config.responseFormat.includeStoryExplanation).toBe(true); // Not overridden
  });
  
  test('missing user config falls back to system', () => {
    const manager = new ConfigManager(SYSTEM_CONFIG, '/nonexistent/user.yaml');
    const config = manager.load();
    
    expect(config.responseFormat.voiceWordLimit).toBe(150);
  });
  
  test('get() retrieves nested values', () => {
    const manager = new ConfigManager(SYSTEM_CONFIG, USER_CONFIG);
    manager.load();
    
    expect(manager.get('responseFormat.voiceWordLimit')).toBe(200);
    expect(manager.get('telos.autoLoad')).toBe(true);
  });
  
  test('get() returns undefined for missing keys', () => {
    const manager = new ConfigManager(SYSTEM_CONFIG, USER_CONFIG);
    manager.load();
    
    expect(manager.get('nonexistent.key')).toBeUndefined();
  });
  
  test('handles malformed YAML gracefully', () => {
    writeFileSync(join(TEST_DIR, 'malformed.yaml'), 'not: valid: yaml:');
    
    const manager = new ConfigManager(join(TEST_DIR, 'malformed.yaml'), USER_CONFIG);
    const config = manager.load();
    
    // Simple parser handles this - just verify it loads
    expect(config).toBeDefined();
  });
});
