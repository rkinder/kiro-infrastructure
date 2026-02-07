# Memory System Installation TODO

## Issue
The memory system is currently only in the repo (`~/src/kiro/kiro-infrastructure/memory/`) but should be installed in the user's Kiro profile directory (`~/.kiro/`) like other skills.

## Current State
- **Source:** `~/src/kiro/kiro-infrastructure/memory/`
- **Hook expects:** `~/src/kiro/kiro-infrastructure/memory/` (hardcoded path)
- **Should be:** `~/.kiro/skills/memory/` or `~/.kiro/memory/`

## Problems
1. Memory system is not portable (tied to repo location)
2. Hook has hardcoded path to repo
3. Not consistent with TELOS and CORE skill installation patterns

## Solution Options

### Option A: Install as Skill (Recommended)
```bash
cp -r ~/src/kiro/kiro-infrastructure/memory ~/.kiro/skills/memory
```

Update hook to use:
```typescript
const MEMORY_PATH = join(HOME, '.kiro/skills/memory');
```

### Option B: Install as Standalone System
```bash
cp -r ~/src/kiro/kiro-infrastructure/memory ~/.kiro/memory
```

Update hook to use:
```typescript
const MEMORY_PATH = join(HOME, '.kiro/memory');
```

### Option C: Make Hook Configurable
Add to `~/.kiro/settings/cli.json`:
```json
{
  "memory": {
    "path": "~/src/kiro/kiro-infrastructure/memory"
  }
}
```

## Recommended Approach
**Option A** - Install as skill for consistency with CORE and TELOS.

## Files to Update
1. `~/.kiro/hooks/AutoProcessMemory.hook.ts` - Update MEMORY_REPO path
2. `~/.kiro/skills/README.md` - Update memory tool paths
3. Installation documentation

## Priority
Medium - Current workaround functions but is not portable or consistent.
