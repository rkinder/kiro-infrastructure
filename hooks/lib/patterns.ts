export interface SecurityPattern {
  pattern: RegExp;
  level: 'block' | 'confirm' | 'alert';
  message: string;
}

export const SECURITY_PATTERNS: SecurityPattern[] = [
  // Blocked patterns - never allow
  { pattern: /rm\s+-rf\s+\/(?!\s*$)/, level: 'block', message: 'Recursive deletion of root directory blocked' },
  { pattern: /:\(\)\{\s*:\|:&\s*\};:/, level: 'block', message: 'Fork bomb detected' },
  { pattern: /dd\s+if=\/dev\/(?:zero|random)\s+of=\/dev\/(?:sda|nvme)/, level: 'block', message: 'Disk wipe command blocked' },
  { pattern: /mkfs\./, level: 'block', message: 'Filesystem format command blocked' },
  
  // Confirmation required
  { pattern: /git\s+push\s+--force/, level: 'confirm', message: 'Force push requires confirmation' },
  { pattern: /sudo\s+rm\s+-rf/, level: 'confirm', message: 'Recursive deletion with sudo requires confirmation' },
  { pattern: /chmod\s+777/, level: 'confirm', message: 'Setting world-writable permissions requires confirmation' },
  { pattern: /rm\s+-rf\s+~/, level: 'confirm', message: 'Deleting home directory requires confirmation' },
  
  // Alert but allow
  { pattern: /sudo\s+/, level: 'alert', message: 'Command uses sudo privileges' },
  { pattern: /curl.*\|\s*(?:bash|sh)/, level: 'alert', message: 'Piping remote script to shell' },
  { pattern: /wget.*\|\s*(?:bash|sh)/, level: 'alert', message: 'Piping remote script to shell' }
];

export function matchPattern(command: string): SecurityPattern | null {
  for (const pattern of SECURITY_PATTERNS) {
    if (pattern.pattern.test(command)) {
      return pattern;
    }
  }
  return null;
}
