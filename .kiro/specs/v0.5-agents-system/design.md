# v0.5 Agents System Design

## Architecture Overview

### System Components
```
~/.kiro/skills/AGENTS/
├── SKILL.md                    # Main skill entry point
├── config/
│   ├── traits.yaml            # Agent trait definitions
│   └── templates.yaml         # Named agent templates
├── templates/
│   ├── Engineer.md            # Engineer agent template
│   ├── Architect.md           # Architect agent template
│   ├── QA.md                  # QA agent template
│   └── Designer.md            # Designer agent template
├── tools/
│   ├── AgentFactory.ts        # Agent composition engine
│   ├── TraitRegistry.ts       # Trait management
│   └── SubagentOrchestrator.ts # Parallel execution manager
└── workflows/
    ├── CreateAgent.md         # Agent creation workflow
    ├── ListTraits.md          # Trait discovery workflow
    └── OrchestrateTasks.md    # Parallel execution workflow
```

### Integration Architecture
```
Kiro CLI
    ↓
AGENTS Skill (SKILL.md)
    ↓
AgentFactory.ts → Agent Prompt
    ↓
use_subagent(prompt, type, model)
    ↓
Subagent Execution
```

## Core Classes

### AgentFactory
```typescript
interface AgentTraits {
  expertise: string;
  personality: string;
  approach: string;
}

interface AgentConfig {
  prompt: string;
  type: string;
  model: string;
  traits: AgentTraits;
}

class AgentFactory {
  constructor(private traitsPath: string);
  
  // Create agent from explicit traits
  createAgent(traits: AgentTraits): AgentConfig;
  
  // Infer traits from task description
  inferAndCreateAgent(taskDescription: string): AgentConfig;
  
  // Get available traits
  getAvailableTraits(): TraitRegistry;
  
  // Create multiple agents with different trait combinations
  createAgentTeam(count: number, taskType?: string): AgentConfig[];
}
```

### TraitRegistry
```typescript
interface TraitDefinition {
  name: string;
  description: string;
  keywords: string[];
  promptFragment: string;
}

interface TraitCategory {
  [key: string]: TraitDefinition;
}

class TraitRegistry {
  expertise: TraitCategory;
  personality: TraitCategory;
  approach: TraitCategory;
  
  // Load traits from YAML
  static load(yamlPath: string): TraitRegistry;
  
  // Find best traits for task
  inferTraits(taskDescription: string): AgentTraits;
  
  // Validate trait combination
  validateTraits(traits: AgentTraits): boolean;
}
```

### SubagentOrchestrator
```typescript
interface SubagentTask {
  id: string;
  prompt: string;
  type: string;
  model: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

class SubagentOrchestrator {
  private maxConcurrent = 4;
  private activeTasks: Map<string, SubagentTask>;
  
  // Execute single agent
  async executeAgent(config: AgentConfig, task: string): Promise<any>;
  
  // Execute multiple agents in parallel
  async executeAgentTeam(configs: AgentConfig[], tasks: string[]): Promise<any[]>;
  
  // Monitor execution status
  getExecutionStatus(): SubagentTask[];
  
  // Wait for all agents to complete
  async waitForCompletion(): Promise<any[]>;
}
```

## Configuration Schema

### traits.yaml Structure
```yaml
expertise:
  security:
    name: "Security Expert"
    description: "Deep knowledge of vulnerabilities and threat models"
    keywords: ["vulnerability", "threat", "exploit", "defense"]
    promptFragment: |
      You are a security expert with deep knowledge of vulnerabilities,
      threat models, and defensive strategies. Focus on identifying risks
      and providing security-first recommendations.

personality:
  skeptical:
    name: "Skeptical"
    description: "Questions assumptions, demands evidence"
    keywords: ["question", "verify", "evidence", "doubt"]
    promptFragment: |
      You approach all claims with healthy skepticism. Demand evidence
      for assertions and question assumptions others take for granted.

approach:
  thorough:
    name: "Thorough"
    description: "Exhaustive analysis, comprehensive coverage"
    keywords: ["complete", "exhaustive", "comprehensive"]
    promptFragment: |
      Be exhaustive in your analysis. Leave no stone unturned and
      provide comprehensive coverage of all relevant aspects.
```

### templates.yaml Structure
```yaml
templates:
  Engineer:
    name: "Software Engineer"
    description: "Elite principal engineer with TDD focus"
    traits:
      expertise: "technical"
      personality: "analytical"
      approach: "systematic"
    model: "claude-3-5-sonnet-20241022"
    capabilities:
      - "Code review and analysis"
      - "Architecture design"
      - "Test-driven development"
      - "Performance optimization"
    
  Architect:
    name: "System Architect"
    description: "System design with enterprise experience"
    traits:
      expertise: "technical"
      personality: "cautious"
      approach: "systematic"
    model: "claude-3-5-sonnet-20241022"
```

## Agent Prompt Template

### Dynamic Agent Prompt Structure
```typescript
const AGENT_PROMPT_TEMPLATE = `
You are a specialized agent with the following characteristics:

EXPERTISE: {{expertise.name}}
{{expertise.promptFragment}}

PERSONALITY: {{personality.name}}
{{personality.promptFragment}}

APPROACH: {{approach.name}}
{{approach.promptFragment}}

TASK CONTEXT:
{{taskDescription}}

OPERATIONAL GUIDELINES:
- Work within your expertise area
- Apply your personality traits to analysis
- Use your approach style for methodology
- Provide specific, actionable recommendations
- Reference your reasoning process

RESPONSE FORMAT:
- Analysis: Key findings and insights
- Recommendations: Specific actions to take
- Reasoning: Why you reached these conclusions
- Next Steps: Suggested follow-up actions
`;
```

## Integration Points

### Kiro CLI Integration
```typescript
// In SKILL.md workflow
async function createCustomAgent(taskDescription: string) {
  const factory = new AgentFactory('~/.kiro/skills/AGENTS/config/traits.yaml');
  const agentConfig = factory.inferAndCreateAgent(taskDescription);
  
  // Use Kiro's subagent system
  const result = await use_subagent({
    prompt: agentConfig.prompt,
    type: agentConfig.type,
    model: agentConfig.model
  });
  
  return result;
}
```

### Parallel Execution Pattern
```typescript
async function orchestrateAgentTeam(tasks: string[]) {
  const factory = new AgentFactory('~/.kiro/skills/AGENTS/config/traits.yaml');
  const orchestrator = new SubagentOrchestrator();
  
  // Create diverse agent team
  const agentConfigs = factory.createAgentTeam(Math.min(tasks.length, 4));
  
  // Execute in parallel
  const results = await orchestrator.executeAgentTeam(agentConfigs, tasks);
  
  return results;
}
```

## Algorithms and Logic

### Trait Inference Algorithm
```typescript
class TraitInferenceEngine {
  inferTraits(taskDescription: string): AgentTraits {
    const keywords = this.extractKeywords(taskDescription);
    
    // Score each trait based on keyword matches
    const expertiseScores = this.scoreTraits(keywords, this.registry.expertise);
    const personalityScores = this.scoreTraits(keywords, this.registry.personality);
    const approachScores = this.scoreTraits(keywords, this.registry.approach);
    
    return {
      expertise: this.selectBestTrait(expertiseScores),
      personality: this.selectBestTrait(personalityScores),
      approach: this.selectBestTrait(approachScores)
    };
  }
  
  private scoreTraits(keywords: string[], traits: TraitCategory): Map<string, number> {
    const scores = new Map<string, number>();
    
    for (const [traitKey, trait] of Object.entries(traits)) {
      let score = 0;
      for (const keyword of keywords) {
        if (trait.keywords.some(tk => keyword.includes(tk) || tk.includes(keyword))) {
          score += 1;
        }
      }
      scores.set(traitKey, score);
    }
    
    return scores;
  }
}
```

### Agent Team Composition
```typescript
class TeamCompositionEngine {
  createDiverseTeam(count: number, taskType?: string): AgentTraits[] {
    const team: AgentTraits[] = [];
    const usedCombinations = new Set<string>();
    
    for (let i = 0; i < count; i++) {
      let traits: AgentTraits;
      let combination: string;
      
      do {
        traits = this.generateTraitCombination(taskType);
        combination = `${traits.expertise}-${traits.personality}-${traits.approach}`;
      } while (usedCombinations.has(combination));
      
      usedCombinations.add(combination);
      team.push(traits);
    }
    
    return team;
  }
}
```

## Configuration Files

### Default traits.yaml
```yaml
# Minimal trait definitions for Kiro compatibility
expertise:
  technical:
    name: "Technical Specialist"
    description: "Software architecture and implementation"
    keywords: ["code", "architecture", "system", "technical"]
    promptFragment: "You are a technical specialist focused on software architecture and implementation."
  
  research:
    name: "Research Specialist"
    description: "Information gathering and analysis"
    keywords: ["research", "analyze", "investigate", "study"]
    promptFragment: "You are a research specialist focused on gathering and analyzing information."

personality:
  analytical:
    name: "Analytical"
    description: "Data-driven, logical approach"
    keywords: ["analyze", "data", "logical", "systematic"]
    promptFragment: "You approach problems analytically with data-driven reasoning."
  
  creative:
    name: "Creative"
    description: "Innovative, lateral thinking"
    keywords: ["creative", "innovative", "novel", "unique"]
    promptFragment: "You think creatively and make unexpected connections."

approach:
  systematic:
    name: "Systematic"
    description: "Structured, methodical approach"
    keywords: ["systematic", "structured", "methodical", "organized"]
    promptFragment: "You work systematically with clear methodology."
  
  rapid:
    name: "Rapid"
    description: "Quick, efficient execution"
    keywords: ["quick", "fast", "efficient", "rapid"]
    promptFragment: "You work quickly and efficiently, focusing on key points."
```

## Monitoring and Observability

### Execution Metrics
```typescript
interface AgentMetrics {
  agentId: string;
  creationTime: number;
  executionTime: number;
  traits: AgentTraits;
  taskType: string;
  success: boolean;
  errorMessage?: string;
}

class AgentMetricsCollector {
  private metrics: AgentMetrics[] = [];
  
  recordAgentExecution(metrics: AgentMetrics): void {
    this.metrics.push(metrics);
    this.logMetrics(metrics);
  }
  
  getPerformanceStats(): {
    averageCreationTime: number;
    averageExecutionTime: number;
    successRate: number;
    mostUsedTraits: AgentTraits;
  } {
    // Calculate performance statistics
  }
}
```

### Logging Strategy
```typescript
// Agent creation logging
logger.info("Creating agent", {
  traits: agentTraits,
  taskType: taskDescription,
  timestamp: Date.now()
});

// Execution logging
logger.info("Agent execution started", {
  agentId: agentId,
  subagentType: config.type,
  model: config.model
});

// Result logging
logger.info("Agent execution completed", {
  agentId: agentId,
  executionTime: endTime - startTime,
  success: result.success
});
```

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1-2)
1. Create AGENTS skill directory structure
2. Implement TraitRegistry and basic YAML loading
3. Create minimal AgentFactory with hardcoded traits
4. Test integration with use_subagent tool

### Phase 2: Dynamic Composition (Week 3-4)
1. Implement trait inference algorithm
2. Add comprehensive trait definitions
3. Create agent prompt template system
4. Test dynamic agent creation

### Phase 3: Orchestration (Week 5-6)
1. Implement SubagentOrchestrator
2. Add parallel execution capabilities
3. Create team composition algorithms
4. Test concurrent agent execution

### Phase 4: Templates and Polish (Week 7-8)
1. Create named agent templates
2. Add workflow documentation
3. Implement metrics and logging
4. Performance optimization and testing

## Testing Strategy

### Unit Tests
- TraitRegistry YAML loading and validation
- AgentFactory trait inference and prompt generation
- SubagentOrchestrator task management
- Template system functionality

### Integration Tests
- End-to-end agent creation and execution
- Parallel agent orchestration
- Kiro CLI skill integration
- File system operations and permissions

### Property-Based Tests
- Agent trait combinations always produce valid prompts (FR-001)
- Trait inference produces consistent results for similar tasks (FR-005)
- Parallel execution respects 4-agent limit (FR-003)
- Template system generates valid agent configurations (FR-004)

## Performance Considerations

### Agent Creation Optimization
- Cache parsed YAML configurations in memory
- Pre-compile prompt templates for faster generation
- Implement trait inference result caching for common patterns

### Parallel Execution Management
- Use Promise.allSettled for robust parallel execution
- Implement proper error isolation between agents
- Add execution timeout handling to prevent hanging

### Memory Management
- Limit trait registry size to prevent memory bloat
- Clean up completed agent execution contexts
- Implement LRU cache for frequently used agent configurations