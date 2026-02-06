import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const CONFIG_PATH = join(process.env.HOME || '~', '.kiro', 'config', 'hooks.yaml');

interface HookConfig {
  telos_path: string;
  backup_path: string;
  journal_path: string;
  log_path: string;
  security: {
    enabled: boolean;
    patterns_file?: string;
  };
}

const DEFAULT_CONFIG: HookConfig = {
  telos_path: join(process.env.HOME || '~', '.kiro', 'context', 'telos'),
  backup_path: join(process.env.HOME || '~', '.kiro', 'backups'),
  journal_path: join(process.env.HOME || '~', '.kiro', 'journals'),
  log_path: join(process.env.HOME || '~', '.kiro', 'logs'),
  security: {
    enabled: true
  }
};

let cachedConfig: HookConfig | null = null;

export async function loadConfig(): Promise<HookConfig> {
  if (cachedConfig) return cachedConfig;
  
  if (!existsSync(CONFIG_PATH)) {
    cachedConfig = DEFAULT_CONFIG;
    return DEFAULT_CONFIG;
  }
  
  try {
    const content = await readFile(CONFIG_PATH, 'utf-8');
    // Simple YAML parsing for basic key-value pairs
    const parsed = parseSimpleYaml(content);
    cachedConfig = { ...DEFAULT_CONFIG, ...parsed };
    return cachedConfig;
  } catch {
    cachedConfig = DEFAULT_CONFIG;
    return DEFAULT_CONFIG;
  }
}

function parseSimpleYaml(content: string): Partial<HookConfig> {
  // Minimal YAML parser for flat config
  const lines = content.split('\n');
  const config: any = {};
  
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      config[match[1]] = match[2];
    }
  }
  
  return config;
}
