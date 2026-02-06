#!/usr/bin/env bun

/**
 * LoadCORE Hook
 * 
 * Automatically loads the CORE skill at session start.
 * Triggered on: agentSpawn
 * 
 * This hook initializes the foundational CORE skill which provides:
 * - TELOS context loading
 * - Response format standardization
 * - Skill loading mechanism
 * - Configuration management
 */

import { CoreSkill } from '../skills/CORE/core';

async function main() {
  try {
    const core = new CoreSkill();
    await core.initialize();
    
    // Output context for agent (if available)
    const context = core.getContext();
    if (context && Object.keys(context).length > 0) {
      console.log('CORE Skill initialized with TELOS context.');
    }
    
    process.exit(0);
  } catch (error) {
    // Silent failure - don't block session start
    process.exit(0);
  }
}

main();
