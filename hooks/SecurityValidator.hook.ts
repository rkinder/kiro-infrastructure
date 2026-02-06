#!/usr/bin/env bun

import { BaseHook, parseInput } from './lib/base';
import { loadConfig } from './lib/config';
import { matchPattern } from './lib/patterns';
import { logger } from './lib/logger';
import type { HookOutput, SecurityDecision } from './lib/types';

class SecurityValidatorHook extends BaseHook {
  async execute(): Promise<HookOutput> {
    const config = await loadConfig();
    
    if (!config.security.enabled) {
      return { continue: true };
    }
    
    const command = this.input.command as string;
    if (!command) {
      return { continue: true };
    }
    
    const decision = this.validateCommand(command);
    
    await logger.info(`Security check: ${command} -> ${decision.decision}`);
    
    return {
      decision: decision.decision,
      message: decision.message,
      continue: decision.decision === 'allow'
    };
  }
  
  private validateCommand(command: string): SecurityDecision {
    const match = matchPattern(command);
    
    if (!match) {
      return { decision: 'allow' };
    }
    
    if (match.level === 'block') {
      return {
        decision: 'block',
        message: `🚫 ${match.message}`,
        pattern: match.pattern.source
      };
    }
    
    if (match.level === 'confirm') {
      return {
        decision: 'ask',
        message: `⚠️  ${match.message}`,
        pattern: match.pattern.source
      };
    }
    
    // Alert level
    return {
      decision: 'allow',
      message: `ℹ️  ${match.message}`,
      pattern: match.pattern.source
    };
  }
}

const input = parseInput();
const hook = new SecurityValidatorHook(input);
const result = await hook.execute();
console.log(JSON.stringify(result));
