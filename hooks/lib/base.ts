import type { HookInput, HookOutput } from './types';

export abstract class BaseHook {
  protected input: HookInput;

  constructor(input: HookInput) {
    this.input = input;
  }

  abstract execute(): Promise<HookOutput>;

  protected output(result: HookOutput): void {
    console.log(JSON.stringify(result));
  }

  protected error(message: string): void {
    this.output({ continue: false, message });
  }
}

export function parseInput(): HookInput {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    return {
      session_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      trigger: 'manual'
    };
  }
  return JSON.parse(args[0]);
}
