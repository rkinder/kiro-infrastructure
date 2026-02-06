# Kiro Infrastructure

Personal AI infrastructure adapted for [Kiro CLI](https://kiro.dev) - bringing PAI's agentic capabilities to Kiro's native hook system.

## What is This?

An adaptation of [danielmiessler/PAI](https://github.com/danielmiessler/PAI) (Personal AI Infrastructure) for Kiro CLI. PAI provides context management, skill systems, and continuous learning - this project ports those concepts to Kiro's simpler, bash-based architecture.

## Project Status

**Current:** v0.3 - Memory System complete ✅  
**Next:** v0.4 - CORE Skill

### Completed Versions

- **v0.1** - TELOS Context System ✅
- **v0.2** - Hook System ✅
- **v0.3** - Memory System ✅ (NEW!)

See [docs/V0.3_COMPLETE.md](docs/V0.3_COMPLETE.md) for details.

## Quick Start

```bash
# Install TELOS (context management)
cp -r releases/v0.1/context/telos ~/.kiro/context/
cp -r releases/v0.1/skills/telos ~/.kiro/skills/
chmod +x ~/.kiro/skills/telos/tools/update-telos.ts

# Install hooks
cp -r hooks ~/.kiro/

# Configure agent to load TELOS context
# Add to ~/.kiro/agents/default.json (or your agent config):
# "hooks": {
#   "agentSpawn": [
#     {
#       "command": "/home/YOUR_USER/.kiro/hooks/LoadContext.hook.ts"
#     }
#   ]
# }

# Set default agent in ~/.kiro/settings/cli.json:
# {
#   "chat.defaultAgent": "default"
# }

# Test it
bun ~/.kiro/skills/telos/tools/update-telos.ts BOOKS.md \
  "- *Your Book* by Author" \
  "Testing installation"
```

## Directory Structure

```
kiro-infrastructure/
├── context/           # Context templates (TELOS, etc.)
│   └── telos/        # Goal and identity files
├── skills/           # Skill definitions and tools
│   └── telos/        # TELOS skill (routing + tools)
├── hooks/            # Bash hook scripts (v0.2+)
├── tools/            # Standalone TypeScript tools
├── docs/             # Analysis and design docs
│   ├── PAI_KIRO_ANALYSIS.md
│   ├── HOOKS_ANALYSIS.md
│   └── TYPESCRIPT_COMPLEXITY_ANALYSIS.md
└── releases/         # Version releases
    └── v0.1/         # TELOS system
```

## Key Differences from PAI

| Aspect | PAI | Kiro Infrastructure |
|--------|-----|---------------------|
| **Location** | `~/.claude/` | `~/.kiro/` |
| **Hooks** | TypeScript | Bash scripts |
| **Structure** | USER/SYSTEM separation | Flat context/skills |
| **Complexity** | Full-featured | Minimal, focused |
| **Dependencies** | Bun required | Bash + optional Bun |

## Releases

### v0.1 - TELOS Context System ✅
- 18 TELOS context files (BELIEFS, GOALS, MISSION, etc.)
- Update tool with backup system
- Skill routing table
- **Status:** Installed and tested

### v0.2 - Hook System ✅
- 5 TypeScript hooks (LoadContext, SecurityValidator, TelosAutoUpdate, UpdateTabTitle, WorkCapture)
- Base infrastructure with error handling and utilities
- Property-based tests for all hooks (15 tests, 100% pass)
- Configuration management system
- **Status:** Implemented and tested

## Documentation

- **[PAI Comparison](docs/PAI_KIRO_ANALYSIS.md)** - Which PAI components map to Kiro
- **[Hook Analysis](docs/HOOKS_ANALYSIS.md)** - PAI hooks → Kiro hooks mapping
- **[TypeScript Complexity](docs/TYPESCRIPT_COMPLEXITY_ANALYSIS.md)** - What needs TypeScript vs bash

## Philosophy

**Match PAI structure closely** - Not reinventing, creating equivalent
**Bash-first** - Use bash hooks where possible, TypeScript only when needed
**User-specific** - Install in `~/.kiro/`, not project-specific
**Incremental** - Start with TELOS, add capabilities as needed

## Upstream Reference

This project references [PAI v2.5](https://github.com/danielmiessler/PAI) for implementation patterns. PAI repo is kept separate to avoid token overhead - we reference specific files only when porting features.

## Contributing

This is a personal adaptation project. If you're interested in similar work:
1. Fork this repo
2. Adapt for your own Kiro setup
3. Share learnings via issues/discussions

## License

MIT - See LICENSE file

## Credits

- **[Daniel Miessler](https://github.com/danielmiessler)** - Original PAI architecture and concepts
- **[Anthropic](https://anthropic.com)** - Claude and Claude Code
- **[Kiro](https://kiro.dev)** - Kiro CLI platform
