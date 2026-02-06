import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class ConfigManager {
  private systemConfig: any;
  private userConfig: any;
  private mergedConfig: any;
  
  constructor(
    private systemPath: string,
    private userPath: string
  ) {}
  
  load(): any {
    // Load system defaults
    this.systemConfig = this.loadYaml(this.systemPath);
    
    // Load user overrides (optional)
    if (existsSync(this.userPath)) {
      this.userConfig = this.loadYaml(this.userPath);
    } else {
      this.userConfig = {};
    }
    
    // Merge with user overrides taking precedence
    this.mergedConfig = this.merge(this.systemConfig, this.userConfig);
    
    return this.mergedConfig;
  }
  
  get(key: string): any {
    if (!this.mergedConfig) {
      this.load();
    }
    
    const keys = key.split('.');
    let value = this.mergedConfig;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }
  
  private loadYaml(path: string): any {
    try {
      const content = readFileSync(path, 'utf-8');
      return this.parseYaml(content);
    } catch (error) {
      throw new Error(`Failed to load config from ${path}: ${error}`);
    }
  }
  
  private parseYaml(content: string): any {
    // Simple YAML parser for basic key-value pairs
    const result: any = {};
    const lines = content.split('\n');
    let currentSection: any = result;
    let currentKey: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const indent = line.search(/\S/);
      const match = trimmed.match(/^([^:]+):\s*(.*)$/);
      
      if (match) {
        const [, key, value] = match;
        
        if (value) {
          // Key with value
          const parsed = this.parseValue(value);
          this.setNested(result, [...currentKey, key], parsed);
        } else {
          // Section header
          currentKey = indent === 0 ? [key] : [...currentKey.slice(0, indent / 2), key];
          this.setNested(result, currentKey, {});
        }
      }
    }
    
    return result;
  }
  
  private parseValue(value: string): any {
    const trimmed = value.trim();
    
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed === 'null') return null;
    if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed);
    if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
    
    return trimmed;
  }
  
  private setNested(obj: any, keys: string[], value: any): void {
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    current[keys[keys.length - 1]] = value;
  }
  
  private merge(base: any, override: any): any {
    const result = { ...base };
    
    for (const key in override) {
      if (typeof override[key] === 'object' && !Array.isArray(override[key]) && override[key] !== null) {
        result[key] = this.merge(result[key] || {}, override[key]);
      } else {
        result[key] = override[key];
      }
    }
    
    return result;
  }
}
