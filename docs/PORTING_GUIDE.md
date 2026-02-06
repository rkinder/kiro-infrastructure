# Porting Guide: PAI → Kiro

## When to Reference PAI Source

### ✅ Reference PAI When:
- Porting a specific tool (open that ONE file)
- Checking implementation details (targeted read)
- Understanding a workflow pattern
- Comparing hook implementations

### ❌ Don't Reference PAI For:
- General context (too expensive - 2,827 files)
- Browsing (use GitHub web interface)
- "Just in case" (load on demand only)

## PAI Source Location

**Repo:** `~/src/claude/Personal_AI_Infrastructure/`
**Keep it:** For reference, don't delete
**Use it:** Sparingly, with targeted file reads

## Porting Workflow

### 1. Identify Component
```bash
# Find the PAI component
cd ~/src/claude/Personal_AI_Infrastructure
find . -name "*ComponentName*"
```

### 2. Read Specific Files
```bash
# Read ONLY the files you need
cat Packs/pai-component-skill/src/Tool.ts
```

### 3. Adapt to Kiro
- Change paths: `~/.claude/` → `~/.kiro/`
- Simplify structure: Remove USER/SYSTEM separation
- Bash-first: Convert to bash if possible
- Document changes in release notes

### 4. Test in Isolation
```bash
# Test the adapted component
bun ~/.kiro/tools/new-tool.ts --test
```

## Component Priority

### Phase 1: Bash-Only (v0.2)
- TELOS automation ✅
- Hook system (5 hooks)
- Security validation
- Work capture

### Phase 2: TypeScript Tools (v0.3+)
- Agent composition
- ISC management
- Browser automation
- Research orchestration

## Path Mapping

| PAI Path | Kiro Path | Notes |
|----------|-----------|-------|
| `~/.claude/skills/CORE/USER/TELOS/` | `~/.kiro/context/telos/` | Simpler structure |
| `~/.claude/skills/CORE/SYSTEM/` | `~/.kiro/skills/` | No USER/SYSTEM split |
| `~/.claude/hooks/*.hook.ts` | `~/.kiro/hooks/*.sh` | TypeScript → Bash |
| `~/.claude/MEMORY/` | `~/.kiro/memory/` | Direct mapping |

## Token Efficiency Tips

1. **Don't load entire PAI repo** - 489MB, 2,827 files
2. **Use targeted reads** - Open specific files only
3. **Document patterns** - Write down what you learned, don't re-read
4. **GitHub web UI** - Browse PAI on GitHub, not locally
5. **Batch porting** - Port multiple related components in one session

## Example: Porting a Hook

### PAI Hook (TypeScript)
```typescript
// ~/.claude/hooks/LoadContext.hook.ts
import { readFileSync } from 'fs';

export default async function LoadContext(event: AgentSpawnEvent) {
  const telos = readFileSync('~/.claude/skills/CORE/USER/TELOS/TELOS.md');
  return { context: telos };
}
```

### Kiro Hook (Bash)
```bash
#!/bin/bash
# ~/.kiro/hooks/load-context.sh

cat ~/.kiro/skills/telos/skill.md
```

**Savings:** 10 lines → 3 lines, no dependencies

## Questions?

See `docs/TYPESCRIPT_COMPLEXITY_ANALYSIS.md` for what needs TypeScript vs bash.
