export class HookError extends Error {
  constructor(message: string, public readonly recoverable: boolean = true) {
    super(message);
    this.name = 'HookError';
  }
}

export function withErrorHandling<T>(
  fn: () => T,
  fallback: T,
  logError: boolean = true
): T {
  try {
    return fn();
  } catch (error) {
    if (logError) {
      console.error(`Hook error: ${error instanceof Error ? error.message : String(error)}`);
    }
    return fallback;
  }
}

export async function withAsyncErrorHandling<T>(
  fn: () => Promise<T>,
  fallback: T,
  logError: boolean = true
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (logError) {
      console.error(`Hook error: ${error instanceof Error ? error.message : String(error)}`);
    }
    return fallback;
  }
}
