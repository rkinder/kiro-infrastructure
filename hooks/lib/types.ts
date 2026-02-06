export interface HookInput {
  session_id: string;
  timestamp: string;
  trigger: string;
  [key: string]: any;
}

export interface HookOutput {
  continue?: boolean;
  decision?: 'allow' | 'block' | 'ask';
  message?: string;
  data?: any;
}

export interface TelosFile {
  path: string;
  name: string;
  content: string;
}

export interface SecurityDecision {
  decision: 'allow' | 'block' | 'ask';
  message?: string;
  pattern?: string;
}

export interface BackupResult {
  success: boolean;
  backupPath?: string;
  error?: string;
}

export interface ChangeLogEntry {
  timestamp: string;
  file: string;
  change: string;
}
