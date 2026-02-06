import { appendFile } from 'fs/promises';
import { join } from 'path';

const LOG_DIR = join(process.env.HOME || '~', '.kiro', 'logs');

export async function log(level: 'info' | 'warn' | 'error', message: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  try {
    await appendFile(join(LOG_DIR, 'hooks.log'), logEntry);
  } catch {
    // Fail silently - logging should never break hooks
  }
}

export const logger = {
  info: (msg: string) => log('info', msg),
  warn: (msg: string) => log('warn', msg),
  error: (msg: string) => log('error', msg)
};
