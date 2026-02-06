# v0.2 Hook System

TypeScript-based hook system for Kiro CLI, adapted from PAI architecture.

## Installation

```bash
# Copy hooks to Kiro directory
cp -r hooks ~/.kiro/

# Copy configuration
cp hooks/hooks.yaml.example ~/.kiro/hooks/hooks.yaml

# Make hooks executable
chmod +x ~/.kiro/hooks/*.hook.ts

# Create required directories
mkdir -p ~/.kiro/{backups/telos,journals,logs}
```

## Configuration

Hooks must be registered in agent configuration files (`~/.kiro/agents/*.json`).

Example agent config with LoadContext hook:

```json
{
  "name": "default",
  "tools": ["*"],
  "hooks": {
    "agentSpawn": [
      {
        "command": "~/.kiro/hooks/LoadContext.hook.ts"
      }
    ]
  }
}
```

See [Kiro CLI Hooks Documentation](https://kiro.dev/docs/cli/hooks/) for details.

## Hooks

### LoadContext.hook.ts
**Trigger**: agentSpawn  
**Purpose**: Auto-loads TELOS context files at conversation start

```bash
# Test manually
echo '{"hook_event_name":"agentSpawn","cwd":"'$(pwd)'"}' | bun ~/.kiro/hooks/LoadContext.hook.ts
```

### SecurityValidator.hook.ts
**Trigger**: PreToolUse  
**Purpose**: Validates commands against security patterns

```bash
# Test with dangerous command
bun ~/.kiro/hooks/SecurityValidator.hook.ts '{"session_id":"test","timestamp":"2026-02-06","trigger":"PreToolUse","command":"git push --force"}'
```

### TelosAutoUpdate.hook.ts
**Trigger**: PostToolUse (fs_write)  
**Purpose**: Auto-backups TELOS files on modification

```bash
# Test with file path
bun ~/.kiro/hooks/TelosAutoUpdate.hook.ts '{"session_id":"test","timestamp":"2026-02-06","trigger":"PostToolUse","file_path":"~/.kiro/context/telos/BELIEFS.md","change_description":"Updated beliefs"}'
```

### UpdateTabTitle.hook.ts
**Trigger**: OnContextChange  
**Purpose**: Updates terminal title based on context

```bash
# Test with context
bun ~/.kiro/hooks/UpdateTabTitle.hook.ts '{"session_id":"test","timestamp":"2026-02-06","trigger":"OnContextChange","context":{"project":"kiro-infrastructure","task":"implement hooks"}}'
```

### WorkCapture.hook.ts
**Trigger**: SessionEnd  
**Purpose**: Logs completed work to daily journal

```bash
# Test with work entry
bun ~/.kiro/hooks/WorkCapture.hook.ts '{"session_id":"test","timestamp":"2026-02-06","trigger":"SessionEnd","task":"Implement hook system","outcome":"Successfully implemented 5 hooks with tests","files_modified":["hooks/LoadContext.hook.ts"]}'
```

## Testing

```bash
cd ~/.kiro/hooks
bun test
```

All hooks include property-based tests verifying:
- **Idempotency**: Repeated operations produce consistent results
- **Consistency**: State remains valid across operations
- **Resilience**: Graceful handling of errors and edge cases
- **Security**: Path traversal prevention and input validation

## Configuration

Edit `~/.kiro/config/hooks.yaml`:

```yaml
telos_path: ~/.kiro/context/telos
backup_path: ~/.kiro/backups
journal_path: ~/.kiro/journals
log_path: ~/.kiro/logs

security:
  enabled: true
```

## Architecture

All hooks extend `BaseHook` and implement:

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

## Requirements Traceability

- **FR-001**: LoadContext.hook.ts
- **FR-002**: SecurityValidator.hook.ts
- **FR-003**: TelosAutoUpdate.hook.ts
- **FR-004**: UpdateTabTitle.hook.ts
- **FR-005**: WorkCapture.hook.ts

See `.kiro/specs/v0.2-hook-system/` for complete requirements and design documentation.
