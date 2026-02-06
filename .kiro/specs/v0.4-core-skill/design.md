# v0.4 CORE Skill Design

## Architecture Overview

### Components
```
~/.kiro/skills/CORE/
├── SKILL.md              # Main skill definition (FR-1, FR-6)
├── system/               # System defaults (FR-4)
│   ├── response-format.ts
│   ├── security.ts
│   └── workflows/
├── user/                 # User overrides (FR-4)
│   └── (empty templates)
├── core.ts              # Main CORE implementation
├── context-loader.ts    # TELOS integration (FR-3)
├── skill-loader.ts      # Skill management (FR-5)
└── types.ts            # TypeScript definitions
```

## Core Classes

### CoreSkill
```typescript
class CoreSkill {
  private telosContext: TelosContext
  private skillRegistry: SkillRegistry
  private responseFormatter: ResponseFormatter
  
  async initialize(): Promise<void>          // FR-1: Auto-loading
  async loadTelosContext(): Promise<void>    // FR-3: Context loading
  async loadSkills(): Promise<void>          // FR-5: Skill loading
  formatResponse(content: any): string       // FR-2: Response format
  routeWorkflow(intent: string): Workflow   // FR-6: Workflow routing
}
```

### TelosContextLoader
```typescript
class TelosContextLoader {
  private telosPath: string = '~/.kiro/telos'
  
  async loadContext(): Promise<TelosContext>     // FR-3
  async validateFiles(): Promise<boolean>        // NFR-2: Graceful handling
  private parseTelosFile(path: string): any     // TELOS file parsing
}
```

### SkillLoader
```typescript
class SkillLoader {
  private skillsPath: string = '~/.kiro/skills'
  
  async loadSkills(): Promise<Skill[]>          // FR-5
  async validateSkill(skill: Skill): boolean    // NFR-5: Security validation
  private resolveDependencies(skills: Skill[]): Skill[]  // Dependency management
}
```

### ResponseFormatter
```typescript
class ResponseFormatter {
  formatResponse(data: ResponseData): string    // FR-2
  formatVoiceOutput(text: string): string      // Voice integration
  validateFormat(response: string): boolean    // Format validation
}
```

## Integration Points

### Hook System Integration
```typescript
// In agentSpawn hook (v0.2 Hooks)
import { CoreSkill } from '~/.kiro/skills/CORE/core.js'

export async function agentSpawn() {
  const core = new CoreSkill()
  await core.initialize()  // FR-1: Auto-loading
  return core
}
```

### Memory System Integration
```typescript
// In CORE initialization
import { MemorySystem } from '~/.kiro/memory/memory.js'

class CoreSkill {
  async initialize() {
    await this.loadTelosContext()     // FR-3
    await this.memory.storeContext(this.telosContext)  // v0.3 Memory integration
  }
}
```

## Configuration

### Default System Configuration
```yaml
# ~/.kiro/skills/CORE/system/config.yaml
response_format:
  sections: [SUMMARY, ANALYSIS, ACTIONS, RESULTS, STATUS, CAPTURE, NEXT, STORY_EXPLANATION, RATE, VOICE]
  voice_max_words: 16
  story_format: numbered_list

security:
  validate_skills: true
  sandbox_execution: true
  allowed_file_paths: ['~/.kiro/**']

performance:
  load_timeout: 2000  # NFR-1: 2 second limit
  max_memory: 52428800  # NFR-1: 50MB limit
```

### User Override Structure
```yaml
# ~/.kiro/skills/CORE/user/config.yaml (optional)
response_format:
  voice_max_words: 20  # User preference override
  
telos:
  auto_load: true
  custom_sections: ['CUSTOM_BELIEFS', 'WORK_CONTEXT']
```

## Algorithms and Logic

### Skill Loading Algorithm
```typescript
class SkillLoader {
  async loadSkills(): Promise<Skill[]> {
    const skillDirs = await this.scanSkillDirectories()  // FR-5
    const skills = await Promise.all(
      skillDirs.map(dir => this.loadSkill(dir))
    )
    
    // Validate all skills before loading any (NFR-5)
    const validSkills = skills.filter(skill => 
      this.validateSkill(skill)
    )
    
    // Resolve dependencies
    return this.resolveDependencies(validSkills)
  }
  
  private resolveDependencies(skills: Skill[]): Skill[] {
    // Topological sort for dependency resolution
    const sorted = []
    const visited = new Set()
    
    function visit(skill: Skill) {
      if (visited.has(skill.name)) return
      visited.add(skill.name)
      
      skill.dependencies?.forEach(dep => {
        const depSkill = skills.find(s => s.name === dep)
        if (depSkill) visit(depSkill)
      })
      
      sorted.push(skill)
    }
    
    skills.forEach(visit)
    return sorted
  }
}
```

### Response Format Algorithm
```typescript
class ResponseFormatter {
  formatResponse(data: ResponseData): string {  // FR-2
    const sections = this.config.response_format.sections
    let response = ''
    
    sections.forEach(section => {
      switch(section) {
        case 'SUMMARY':
          response += `📋 SUMMARY: ${data.summary}\n`
          break
        case 'VOICE':
          const voice = this.formatVoiceOutput(data.voice)
          response += `🗣️ ${this.config.daidentity.name}: ${voice}\n`
          break
        // ... other sections
      }
    })
    
    return response
  }
  
  formatVoiceOutput(text: string): string {
    const words = text.split(' ')
    const maxWords = this.config.response_format.voice_max_words
    
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(' ')
    }
    
    return text
  }
}
```

## Monitoring and Observability

### Metrics
```typescript
// Performance metrics (NFR-1)
core_load_time_seconds{component="telos"} 
core_load_time_seconds{component="skills"}
core_memory_usage_bytes
skill_load_errors_total{skill_name}
```

### Logging
```typescript
// Structured logging
logger.info("CORE initialization started", {
  session_id: sessionId,
  telos_files_found: telosFiles.length,
  skills_found: skillDirs.length
})

logger.error("Skill validation failed", {
  skill_name: skill.name,
  validation_errors: errors,
  security_check: false
})
```

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1-2)
1. Implement basic CoreSkill class with auto-loading (FR-1)
2. Create response formatter with standardized format (FR-2)
3. Integrate with agentSpawn hook (TC-3)

### Phase 2: Context Integration (Week 3)
1. Implement TelosContextLoader (FR-3)
2. Add graceful error handling for missing files (NFR-2)
3. Integrate with Memory system (TC-4)

### Phase 3: Skill System (Week 4-5)
1. Implement SkillLoader with validation (FR-5, NFR-5)
2. Add dependency resolution algorithm
3. Create workflow routing system (FR-6)

### Phase 4: Security & Polish (Week 6)
1. Implement security protocols (FR-7)
2. Add comprehensive error handling
3. Performance optimization (NFR-1)

## Testing Strategy

### Unit Tests
- CoreSkill initialization and auto-loading
- Response format validation and generation
- TELOS context loading with various file states
- Skill loading and dependency resolution

### Integration Tests  
- End-to-end session start with CORE loading
- Hook system integration with agentSpawn
- Memory system integration for context storage
- Multi-skill loading scenarios

### Property-Based Tests
- Response format always contains required sections (FR-2)
- Voice output never exceeds word limit
- All loaded skills have valid metadata (FR-5)
- Context loading is idempotent (FR-3)

## Performance Considerations

### Loading Optimization
- Lazy load skills only when needed
- Cache parsed TELOS context between sessions
- Parallel loading of independent skills
- Timeout mechanisms for slow operations (NFR-1)

### Memory Management
- Limit skill memory usage (NFR-1: 50MB total)
- Garbage collect unused context data
- Stream large TELOS files instead of loading entirely

## Security Considerations

### Skill Validation (NFR-5)
- Validate skill metadata schema
- Sandbox skill execution environments
- Restrict file system access to ~/.kiro/
- Code signing verification for skills

### Context Security (FR-7)
- Encrypt sensitive TELOS data at rest
- Validate TELOS file integrity
- Prevent path traversal attacks
- Audit logging for security events