# CORE Skill

**Version:** 0.4.0  
**Status:** In Development

## Purpose

CORE is the foundational skill for Kiro CLI that provides:
- System configuration management
- TELOS context loading
- Response format standardization
- Skill loading mechanism
- Workflow routing
- Security protocols

## Auto-Loading

CORE automatically loads at session start via the `agentSpawn` hook. No manual activation required.

## Configuration

### System Defaults
Located in `system/config.yaml` - do not modify directly.

### User Overrides
Create `user/config.yaml` to override system defaults:

```yaml
responseFormat:
  voiceWordLimit: 200
  includeStoryExplanation: true
```

## Usage

CORE operates transparently in the background. It:
1. Loads your TELOS context from `~/.kiro/telos/`
2. Applies response formatting to all outputs
3. Routes workflows to appropriate skills
4. Manages skill loading and dependencies

## Integration

Other skills can access CORE functionality:

```typescript
import { CoreSkill } from '~/.kiro/skills/CORE/core';

const core = new CoreSkill();
await core.initialize();
const context = core.getContext();
```

## Dependencies

None - CORE is the foundation skill.

## Future Skills

- v0.5: AGENTS (depends on CORE)
- v0.6: THEALGORITHM (depends on CORE + AGENTS)
