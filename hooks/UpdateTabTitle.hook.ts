#!/usr/bin/env bun

import { BaseHook, parseInput } from './lib/base';
import { generateTitle, setTerminalTitle } from './lib/terminal';
import type { HookOutput } from './lib/types';

class UpdateTabTitleHook extends BaseHook {
  async execute(): Promise<HookOutput> {
    const context = this.input.context || {};
    const title = generateTitle(context);
    
    setTerminalTitle(title);
    
    return { continue: true, data: { title } };
  }
}

const input = parseInput();
const hook = new UpdateTabTitleHook(input);
const result = await hook.execute();
console.log(JSON.stringify(result));
