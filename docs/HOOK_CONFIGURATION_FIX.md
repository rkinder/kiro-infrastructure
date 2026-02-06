# Hook Configuration Fix

## Problem

TELOS context was not being auto-injected into conversations. The LoadContext hook was implemented but not configured in agent settings.

## Root Cause

Three issues prevented TELOS context from loading:

1. **Hooks not registered**: Kiro CLI hooks must be explicitly registered in agent configuration files (`~/.kiro/agents/*.json`)
2. **Wrong output format**: LoadContext hook was outputting JSON instead of raw context to STDOUT
3. **No default agent**: Running `kiro-cli chat` without `--agent` flag doesn't use any agent config, so hooks never run

From [Kiro Hooks Documentation](https://kiro.dev/docs/cli/hooks/):
- Hooks are defined in the `hooks` field of agent configs
- `agentSpawn` hooks run when an agent is activated
- Exit code 0 means STDOUT is added to agent's context (not JSON-wrapped)

## Solution

### 1. Created Default Agent

Created `~/.kiro/agents/default.json` with LoadContext hook:

```json
{
  "name": "default",
  "description": "Default agent with TELOS context auto-loading",
  "tools": ["*"],
  "allowedTools": [
    "fs_read",
    "grep",
    "glob",
    "code",
    "git_status",
    "git_log"
  ],
  "hooks": {
    "agentSpawn": [
      {
        "command": "/home/YOUR_USERNAME/.kiro/hooks/LoadContext.hook.ts"
      }
    ]
  }
}
```

Note: Used absolute path instead of `~` as tilde expansion may not work in hook commands.

### 2. Fixed Hook Output Format

Changed LoadContext.hook.ts to output context directly to STDOUT instead of JSON:

```typescript
// Before (incorrect):
console.log(JSON.stringify(result));

// After (correct):
if (result.data) {
  console.log(result.data);  // Raw context output
  process.exit(0);
} else {
  console.error(result.message || 'Failed to load TELOS context');
  process.exit(1);
}
```

Kiro's agentSpawn hooks expect raw STDOUT content, not JSON-wrapped data.

### 2. Updated Existing Agents

Added the same hook configuration to:
- `~/.kiro/agents/coding.json`
- `~/.kiro/agents/architect.json`

### 3. Updated Existing Agents

Added the same hook configuration to:
- `~/.kiro/agents/coding.json`
- `~/.kiro/agents/architect.json`

### 4. Set Default Agent

Added `chat.defaultAgent` to `~/.kiro/settings/cli.json`:

```json
{
  "chat.defaultAgent": "default"
}
```

Without this setting, `kiro-cli chat` doesn't use any agent config and hooks won't run.

### 5. Updated Documentation

Updated the following files to reflect correct configuration:
- `/home/YOUR_USERNAME/src/kiro/kiro-infrastructure/README.md`
- `/home/YOUR_USERNAME/src/kiro/kiro-infrastructure/hooks/README.md`
- `~/.kiro/hooks/README.md`

## Testing

Manual test confirms the hook works:

```bash
echo '{"hook_event_name":"agentSpawn","cwd":"'$(pwd)'"}' | bun ~/.kiro/hooks/LoadContext.hook.ts
```

Output: Successfully loads all TELOS context files and formats them for injection.

## Next Steps

1. Start a new Kiro CLI session
2. Verify TELOS context is automatically loaded
3. Test by asking about your principles/philosophy (should reference TELOS content)

## Files Modified

### User Profile
- `~/.kiro/agents/default.json` (created)
- `~/.kiro/agents/coding.json` (updated)
- `~/.kiro/agents/architect.json` (updated)
- `~/.kiro/hooks/README.md` (updated)

### Project Repository
- `/home/YOUR_USERNAME/src/kiro/kiro-infrastructure/README.md`
- `/home/YOUR_USERNAME/src/kiro/kiro-infrastructure/hooks/README.md`
- `/home/YOUR_USERNAME/src/kiro/kiro-infrastructure/docs/HOOK_CONFIGURATION_FIX.md` (this file)

## Key Learnings

1. **Hooks require explicit registration** - Not auto-discovered by filename
2. **Agent configs are the source of truth** - All hook configuration lives in `~/.kiro/agents/*.json`
3. **Hook naming convention** - `*.hook.ts` is for organization, not discovery
4. **Testing hooks** - Must pass proper JSON input via STDIN for manual testing
5. **Output format matters** - agentSpawn hooks output raw content to STDOUT, not JSON
6. **Path expansion** - Use absolute paths in hook commands, not `~`
7. **Default agent required** - Set `chat.defaultAgent` in `~/.kiro/settings/cli.json` or use `--agent` flag
