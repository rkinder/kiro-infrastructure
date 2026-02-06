# v0.2 Hook System Design

## Architecture Overview

### System Integration
The v0.2 Hook System integrates with Kiro CLI's native hook system through TypeScript modules installed in `~/.kiro/hooks/`. Each hook follows the PAI pattern of executable TypeScript files with specific trigger points and standardized input/output interfaces.

### Hook Execution Flow
```
Kiro CLI Event → Hook Trigger → TypeScript Module → Bun Runtime → Output Processing
```

### Core Components
- **LoadContext.hook.ts**: TELOS context injection at session start
- **SecurityValidator.hook.ts**: Command validation before execution  
- **TelosAutoUpdate.hook.ts**: Automatic backup on TELOS file writes
- **UpdateTabTitle.hook.ts**: Dynamic terminal title updates
- **WorkCapture.hook.ts**: Session logging and work journaling

## Hook Architecture

### Base Hook Interface
```typescript
interface HookInput {
  session_id: string;
  timestamp: string;
  trigger: string;
  [key: string]: any;
}

interface HookOutput {
  continue?: boolean;
  decision?: 'allow' | 'block' | 'ask';
  message?: string;
  data?: any;
}
```

### Hook Lifecycle
1. **Trigger Detection**: Kiro CLI detects hook trigger event
2. **Input Preparation**: Event data serialized to JSON
3. **Hook Execution**: Bun executes TypeScript hook file
4. **Output Processing**: Hook returns JSON response via stdout
5. **Action Resolution**: Kiro CLI processes hook decision

## Individual Hook Designs

### LoadContext.hook.ts (FR-001)
**Trigger**: SessionStart  
**Purpose**: Load TELOS context files automatically

```typescript
class LoadContextHook {
  private telosPath = '~/.kiro/context/telos/';
  
  async execute(): Promise<void> {
    const files = await this.scanTelosFiles();
    const context = await this.loadAndFormat(files);
    this.outputContext(context);
  }
  
  private async scanTelosFiles(): Promise<string[]> {
    // Scan for .md files in TELOS directory
  }
  
  private async loadAndFormat(files: string[]): Promise<string> {
    // Load files and format for AI consumption
  }
}
```

**Data Flow**:
1. Scan `~/.kiro/context/telos/` for `.md` files
2. Read file contents with error handling
3. Format as structured context block
4. Output to stdout for Kiro CLI consumption

### SecurityValidator.hook.ts (FR-002)
**Trigger**: PreToolUse (Bash commands)  
**Purpose**: Validate commands against security patterns

```typescript
class SecurityValidatorHook {
  private patterns = {
    blocked: [/rm\s+-rf\s+\//, /format\s+/, /dd\s+if=/],
    confirm: [/git\s+push\s+--force/, /sudo\s+rm/, /chmod\s+777/],
    alert: [/sudo\s+/, /curl.*\|\s*sh/, /wget.*\|\s*sh/]
  };
  
  async validate(command: string): Promise<HookOutput> {
    if (this.isBlocked(command)) {
      return { decision: 'block', message: 'Dangerous command blocked' };
    }
    if (this.needsConfirmation(command)) {
      return { decision: 'ask', message: 'Confirm dangerous operation?' };
    }
    return { continue: true };
  }
}
```

**Security Patterns**:
- **Blocked**: Immediate prevention (rm -rf /, format commands)
- **Confirm**: User confirmation required (force push, sudo rm)
- **Alert**: Logged but allowed (sudo operations)

### TelosAutoUpdate.hook.ts (FR-003)
**Trigger**: PreFileWrite (TELOS files)  
**Purpose**: Create backups before TELOS modifications

```typescript
class TelosAutoUpdateHook {
  private backupPath = '~/.kiro/backups/telos/';
  
  async execute(filePath: string): Promise<HookOutput> {
    if (this.isTelosFile(filePath)) {
      await this.createBackup(filePath);
      await this.updateChangeLog(filePath);
    }
    return { continue: true };
  }
  
  private async createBackup(filePath: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const backupFile = `${this.backupPath}/${basename(filePath)}.${timestamp}.bak`;
    await copyFile(filePath, backupFile);
  }
}
```

**Backup Strategy**:
- Timestamped backup files: `filename.2024-01-15T10:30:00Z.bak`
- Organized directory structure: `~/.kiro/backups/telos/YYYY/MM/`
- Change log updates with modification metadata

### UpdateTabTitle.hook.ts (FR-004)
**Trigger**: UserPromptSubmit, ContextChange  
**Purpose**: Update terminal title with current context

```typescript
class UpdateTabTitleHook {
  async execute(context: any): Promise<void> {
    const title = await this.generateTitle(context);
    await this.updateTerminalTitle(title);
  }
  
  private async generateTitle(context: any): Promise<string> {
    // Generate 3-5 word context-aware title
    return this.summarizeActivity(context);
  }
  
  private async updateTerminalTitle(title: string): Promise<void> {
    // Use terminal escape sequences for title update
    process.stdout.write(`\x1b]0;${title}\x07`);
  }
}
```

**Title Generation**:
- Context-aware 3-5 word phrases
- Activity-based summaries (e.g., "Fixing auth bug")
- Terminal emulator compatibility (kitty, xterm, etc.)

### WorkCapture.hook.ts (FR-005)
**Trigger**: SessionEnd, WorkComplete  
**Purpose**: Log completed work to journal

```typescript
class WorkCaptureHook {
  private journalPath = '~/.kiro/journal/';
  
  async execute(sessionData: any): Promise<void> {
    const entry = await this.createJournalEntry(sessionData);
    await this.appendToJournal(entry);
  }
  
  private async createJournalEntry(data: any): Promise<JournalEntry> {
    return {
      timestamp: new Date().toISOString(),
      session_id: data.session_id,
      commands: data.commands,
      outcomes: data.outcomes,
      summary: data.summary
    };
  }
}
```

**Journal Format**:
- Chronological entries with timestamps
- Command history and outcomes
- Session summaries and achievements
- Searchable JSON format

## Data Flow and Integration

### Context Loading Flow
```
Session Start → LoadContext Hook → TELOS Files → Formatted Context → Kiro CLI
```

### Security Validation Flow
```
Command Input → SecurityValidator → Pattern Check → Decision → Execution/Block
```

### Backup Flow
```
File Write → TelosAutoUpdate → Backup Creation → Change Log → Original Operation
```

### Title Update Flow
```
User Prompt → UpdateTabTitle → Context Analysis → Title Generation → Terminal Update
```

### Work Logging Flow
```
Session Activity → WorkCapture → Journal Entry → Persistent Storage
```

## Error Handling Strategy

### Graceful Degradation
- Missing TELOS files: Log warning, continue with empty context
- Security pattern failures: Default to safe (allow operation)
- Backup failures: Log error, don't block original operation
- Title update failures: Silent failure (non-critical)
- Journal write failures: Log error, don't block session end

### Error Categories
```typescript
enum ErrorSeverity {
  FATAL = 'fatal',     // Exit with code 1, block operation
  WARNING = 'warning', // Log and continue
  INFO = 'info'        // Silent logging only
}
```

### Recovery Mechanisms
- Automatic retry for transient failures
- Fallback to default behavior when possible
- Comprehensive error logging for debugging
- User notification for critical failures only

## Performance Considerations

### Execution Constraints
- **LoadContext**: < 50ms (blocking session start)
- **SecurityValidator**: < 10ms (blocking command execution)
- **TelosAutoUpdate**: < 300ms (blocking file operations)
- **UpdateTabTitle**: < 200ms (non-blocking)
- **WorkCapture**: < 100ms (non-blocking session end)

### Optimization Strategies
- Lazy loading of configuration files
- Cached pattern matching for security validation
- Asynchronous backup operations where possible
- Minimal memory footprint (< 50MB total)

### Resource Management
- File handle cleanup after operations
- Memory-efficient file processing for large TELOS files
- Connection pooling for external services (if needed)

## Configuration and Extensibility

### Configuration Files
```yaml
# ~/.kiro/config/hooks.yaml
hooks:
  load_context:
    enabled: true
    telos_path: "~/.kiro/context/telos/"
  security_validator:
    enabled: true
    strict_mode: false
  telos_auto_update:
    enabled: true
    backup_retention: 30 # days
```

### Extension Points
- Custom security patterns via configuration
- Pluggable title generation strategies
- Configurable backup retention policies
- Custom journal formats and destinations

## Testing Strategy

### Unit Testing
Each hook includes comprehensive unit tests covering:
- Core functionality validation
- Error handling scenarios
- Edge cases and boundary conditions
- Performance benchmarks

### Property-Based Testing
Mandatory property tests for each hook:
- **LoadContext**: Context loading idempotency
- **SecurityValidator**: Pattern matching consistency
- **TelosAutoUpdate**: Backup integrity preservation
- **UpdateTabTitle**: Title generation determinism
- **WorkCapture**: Journal entry completeness

### Integration Testing
- End-to-end hook execution flows
- Kiro CLI integration validation
- File system operation testing
- Terminal compatibility verification

### Test Properties and Invariants
```typescript
// Example property tests
describe('LoadContext Properties', () => {
  property('Loading same files twice produces identical context', 
    fc.array(fc.string()), (files) => {
      const context1 = loadContext(files);
      const context2 = loadContext(files);
      return context1 === context2;
    });
});
```

## Security Considerations

### Input Validation
- Path traversal prevention for file operations
- Command injection protection in security validator
- Sanitization of user input in title generation

### File System Security
- Restricted file access to designated directories
- Proper permission handling for backup operations
- Secure temporary file creation and cleanup

### Data Protection
- No sensitive data in log files
- Encrypted storage for security audit logs
- Minimal data retention policies

## Deployment and Installation

### Installation Process
1. Copy hook files to `~/.kiro/hooks/`
2. Set executable permissions: `chmod +x *.hook.ts`
3. Verify Bun runtime availability
4. Create required directory structure
5. Initialize configuration files

### Directory Structure
```
~/.kiro/
├── hooks/
│   ├── LoadContext.hook.ts
│   ├── SecurityValidator.hook.ts
│   ├── TelosAutoUpdate.hook.ts
│   ├── UpdateTabTitle.hook.ts
│   └── WorkCapture.hook.ts
├── config/
│   └── hooks.yaml
├── backups/
│   └── telos/
└── journal/
    └── work.jsonl
```

### Verification Steps
- Hook registration with Kiro CLI
- Trigger event testing
- Output format validation
- Performance benchmark execution
- Integration test suite completion

## Migration from PAI Patterns

### Adaptation Strategy
- Simplify PAI complex error handling for Kiro's architecture
- Remove PAI-specific dependencies (voice, advanced AI inference)
- Adapt file paths and directory structures for Kiro conventions
- Maintain core functionality while reducing complexity

### Key Differences from PAI
- No voice announcements (PAI UpdateTabTitle feature)
- Simplified context loading (no AI steering rules)
- Basic security patterns (no advanced ML-based detection)
- Minimal configuration (no complex pattern files)
- Direct Bun execution (no shell script wrappers)

### Preserved Patterns
- Hook trigger system and event handling
- JSON input/output interface design
- Error handling and graceful degradation
- File operation safety and backup strategies
- Terminal integration and escape sequence usage