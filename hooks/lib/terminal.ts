export function setTerminalTitle(title: string): void {
  const truncated = truncateTitle(title, 80);
  process.stdout.write(`\x1b]0;${truncated}\x07`);
}

export function truncateTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) {
    return title;
  }
  return title.substring(0, maxLength - 3) + '...';
}

export function generateTitle(context: Record<string, any>): string {
  const parts: string[] = ['Kiro'];
  
  if (context.project) {
    parts.push(context.project);
  }
  
  if (context.task) {
    parts.push(context.task);
  }
  
  if (context.agent) {
    parts.push(`[${context.agent}]`);
  }
  
  return parts.join(' - ');
}
