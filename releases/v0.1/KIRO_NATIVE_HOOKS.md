# Kiro CLI Native Hook Support - Implementation Plan

## 🎉 MAJOR DISCOVERY

**Kiro CLI already has a built-in hook system!** This means we can implement PAI's hook functionality natively.

---

## Kiro's Hook System

### Available Hook Types

| Kiro Hook | PAI Equivalent | Match |
|-----------|----------------|-------|
| **AgentSpawn** | SessionStart | ✅ Perfect match |
| **UserPromptSubmit** | UserPromptSubmit | ✅ Perfect match |
| **PreToolUse** | PreToolUse | ✅ Perfect match |
| **PostToolUse** | PostToolUse | ✅ Perfect match |
| **Stop** | Stop | ✅ Perfect match |
| ❌ SubagentStop | SubagentStop | ❌ Not available |

**Result:** 5 out of 6 PAI hook types are natively supported!

---

## How Kiro Hooks Work

### Hook Definition (in agent config)

```json
{
  "hooks": [
    {
      "event": "agentSpawn",
      "command": "~/.kiro/hooks/load-context.sh"
    },
    {
      "event": "preToolUse",
      "command": "~/.kiro/hooks/security-validator.sh",
      "matcher": "execute_bash"
    },
    {
      "event": "stop",
      "command": "~/.kiro/hooks/work-capture.sh"
    }
  ]
}
```

### Hook Input (via STDIN)

```json
{
  "hook_event_name": "preToolUse",
  "cwd": "/current/working/directory",
  "tool_name": "execute_bash",
  "tool_input": {
    "command": "rm -rf /"
  }
}
```

### Hook Output (via exit codes)

- **Exit 0**: Success (STDOUT captured)
- **Exit 2**: (PreToolUse only) Block tool execution
- **Other**: Warning shown to user

---

## Implementation Plan for PAI Hooks on Kiro

### Phase 1: Essential Hooks (Week 1)

#### 1. LoadContext (AgentSpawn)

**Purpose:** Auto-load TELOS skill routing at session start

**Implementation:**
```bash
#!/bin/bash
# ~/.kiro/hooks/load-context.sh

# Read TELOS skill definition
cat ~/.kiro/skills/telos/skill.md

# Output goes to agent's context automatically
```

**Kiro Config:**
```json
{
  "hooks": [
    {
      "event": "agentSpawn",
      "command": "~/.kiro/hooks/load-context.sh",
      "cache_ttl_seconds": 300
    }
  ]
}
```

**Result:** TELOS skill routing is automatically available in every session!

---

#### 2. SecurityValidator (PreToolUse)

**Purpose:** Block dangerous bash commands

**Implementation:**
```bash
#!/bin/bash
# ~/.kiro/hooks/security-validator.sh

# Read hook event from STDIN
EVENT=$(cat)

# Extract command
COMMAND=$(echo "$EVENT" | jq -r '.tool_input.command // ""')

# Check against dangerous patterns
if echo "$COMMAND" | grep -qE "rm -rf /|mkfs|dd if=|:(){:|fork bomb"; then
  echo "🚫 BLOCKED: Dangerous command detected" >&2
  exit 2  # Block execution
fi

# Allow execution
exit 0
```

**Kiro Config:**
```json
{
  "hooks": [
    {
      "event": "preToolUse",
      "command": "~/.kiro/hooks/security-validator.sh",
      "matcher": "execute_bash"
    }
  ]
}
```

**Result:** Dangerous commands are blocked before execution!

---

#### 3. WorkCapture (Stop)

**Purpose:** Log completed work and capture feedback

**Implementation:**
```bash
#!/bin/bash
# ~/.kiro/hooks/work-capture.sh

# Read hook event
EVENT=$(cat)
CWD=$(echo "$EVENT" | jq -r '.cwd')

# Create work log entry
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="$HOME/.kiro/memory/work-log.md"

# Append work entry
echo "## $TIMESTAMP" >> "$LOG_FILE"
echo "- **Directory**: $CWD" >> "$LOG_FILE"
echo "- **Session**: Completed" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit 0
```

**Kiro Config:**
```json
{
  "hooks": [
    {
      "event": "stop",
      "command": "~/.kiro/hooks/work-capture.sh"
    }
  ]
}
```

**Result:** Every session is automatically logged!

---

### Phase 2: Enhanced Hooks (Week 2)

#### 4. UpdateTabTitle (UserPromptSubmit)

**Purpose:** Update terminal title with current context

**Implementation:**
```bash
#!/bin/bash
# ~/.kiro/hooks/update-tab-title.sh

EVENT=$(cat)
PROMPT=$(echo "$EVENT" | jq -r '.prompt')

# Extract first 50 chars of prompt
TITLE=$(echo "$PROMPT" | cut -c1-50)

# Update terminal title
echo -ne "\033]0;Kiro: $TITLE\007" >&2

exit 0
```

---

#### 5. TelosAutoUpdate (PostToolUse)

**Purpose:** Auto-update TELOS when files are modified

**Implementation:**
```bash
#!/bin/bash
# ~/.kiro/hooks/telos-auto-update.sh

EVENT=$(cat)
TOOL_NAME=$(echo "$EVENT" | jq -r '.tool_name')

# Only process file writes
if [ "$TOOL_NAME" != "fs_write" ]; then
  exit 0
fi

# Check if TELOS file was modified
PATH=$(echo "$EVENT" | jq -r '.tool_input.path')

if echo "$PATH" | grep -q "\.kiro/context/telos"; then
  # Create backup automatically
  FILENAME=$(basename "$PATH")
  TIMESTAMP=$(date '+%Y%m%d-%H%M%S')
  BACKUP_DIR="$HOME/.kiro/context/telos/backups"
  
  mkdir -p "$BACKUP_DIR"
  cp "$PATH" "$BACKUP_DIR/${FILENAME%.md}-$TIMESTAMP.md"
  
  # Log to updates.md
  echo "## $(date '+%Y-%m-%d %H:%M:%S')" >> "$HOME/.kiro/context/telos/updates.md"
  echo "- **File Modified**: $FILENAME" >> "$HOME/.kiro/context/telos/updates.md"
  echo "- **Change Type**: Direct Edit" >> "$HOME/.kiro/context/telos/updates.md"
  echo "" >> "$HOME/.kiro/context/telos/updates.md"
fi

exit 0
```

**Result:** TELOS files are automatically backed up when edited!

---

## Complete Kiro Agent Configuration

```json
{
  "name": "kiro-with-telos",
  "description": "Kiro agent with PAI TELOS integration",
  "hooks": [
    {
      "event": "agentSpawn",
      "command": "~/.kiro/hooks/load-context.sh",
      "cache_ttl_seconds": 300,
      "timeout_ms": 5000
    },
    {
      "event": "preToolUse",
      "command": "~/.kiro/hooks/security-validator.sh",
      "matcher": "execute_bash",
      "timeout_ms": 1000
    },
    {
      "event": "postToolUse",
      "command": "~/.kiro/hooks/telos-auto-update.sh",
      "matcher": "fs_write",
      "timeout_ms": 2000
    },
    {
      "event": "userPromptSubmit",
      "command": "~/.kiro/hooks/update-tab-title.sh",
      "timeout_ms": 500
    },
    {
      "event": "stop",
      "command": "~/.kiro/hooks/work-capture.sh",
      "timeout_ms": 3000
    }
  ]
}
```

---

## Directory Structure

```
~/.kiro/
├── hooks/                          # Hook scripts
│   ├── load-context.sh             # AgentSpawn
│   ├── security-validator.sh       # PreToolUse
│   ├── telos-auto-update.sh        # PostToolUse
│   ├── update-tab-title.sh         # UserPromptSubmit
│   └── work-capture.sh             # Stop
├── context/
│   └── telos/                      # TELOS data
├── skills/
│   └── telos/                      # TELOS skill
├── memory/
│   └── work-log.md                 # Work capture log
└── agents/
    └── telos-agent.json            # Agent config with hooks
```

---

## Advantages of Kiro's Native Hooks

### vs PAI's TypeScript Hooks

| Feature | PAI (TypeScript) | Kiro (Native) |
|---------|------------------|---------------|
| **Language** | TypeScript only | Any language (bash, Python, etc.) |
| **Runtime** | Requires Bun | No runtime needed |
| **Installation** | Complex setup | Simple scripts |
| **Debugging** | TypeScript debugging | Standard shell debugging |
| **Performance** | Fast (compiled) | Fast (native) |
| **Portability** | Requires Bun | Works anywhere |

### Key Benefits

1. **Simpler** - Bash scripts vs TypeScript
2. **No dependencies** - No Bun required for hooks
3. **More flexible** - Use any language
4. **Easier debugging** - Standard shell tools
5. **Native integration** - Built into Kiro

---

## Migration Path from PAI

### PAI Hook → Kiro Hook

| PAI Hook (TypeScript) | Kiro Hook (Bash) | Effort |
|----------------------|------------------|--------|
| LoadContext.hook.ts | load-context.sh | 1 hour |
| SecurityValidator.hook.ts | security-validator.sh | 2 hours |
| WorkCompletionLearning.hook.ts | work-capture.sh | 2 hours |
| UpdateTabTitle.hook.ts | update-tab-title.sh | 1 hour |
| AutoWorkCreation.hook.ts | telos-auto-update.sh | 2 hours |

**Total effort:** ~8 hours (vs 10-13 hours for TypeScript)

---

## Next Steps

### Immediate (This Week)

1. **Create hook scripts** (5 scripts, ~8 hours)
2. **Create agent config** (1 file, ~30 minutes)
3. **Test each hook** (~2 hours)
4. **Document usage** (~1 hour)

**Total:** ~12 hours to full PAI-style automation

### Testing Plan

```bash
# 1. Test LoadContext
kiro-cli chat --agent telos-agent
# Should auto-load TELOS skill routing

# 2. Test SecurityValidator
> "Run: rm -rf /"
# Should block with error message

# 3. Test TelosAutoUpdate
> "Edit my GOALS.md file"
# Should auto-create backup

# 4. Test WorkCapture
> "Help me with something"
# Should log to work-log.md after response

# 5. Test UpdateTabTitle
> "What's the weather?"
# Terminal title should update
```

---

## Comparison: v0.1 vs v0.2 (with hooks)

| Feature | v0.1 (Manual) | v0.2 (Hooks) |
|---------|---------------|--------------|
| **Skill Loading** | Manual reference | Auto-loaded |
| **Security** | None | Automatic validation |
| **TELOS Updates** | Manual tool call | Auto-backup on edit |
| **Work Logging** | None | Automatic |
| **Tab Title** | Static | Dynamic |
| **User Experience** | Manual | Automatic |

---

## Recommendation

**Build v0.2 with native Kiro hooks immediately!**

**Why:**
- ✅ Kiro already supports hooks natively
- ✅ Simpler than TypeScript (bash scripts)
- ✅ No additional dependencies
- ✅ ~12 hours to full automation
- ✅ Makes TELOS "just work"

**This is the missing piece that makes Kiro v0.1 → v0.2 a game-changer.**
