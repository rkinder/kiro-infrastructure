# THEALGORITHM v0.6 Design

## Architecture Overview

### System Components
```
THEALGORITHM/
├── Core/
│   ├── EffortClassifier.ts      # FR-1: Effort classification
│   ├── CapabilityLoader.ts      # FR-2: Load capabilities by effort
│   ├── ISCManager.ts            # FR-3: ISC lifecycle management
│   └── PhaseEngine.ts           # FR-4: 7-phase execution engine
├── Phases/
│   ├── ObservePhase.ts          # Create ISC rows from request + context
│   ├── ThinkPhase.ts            # Complete ISC rows, ensure nothing missing
│   ├── PlanPhase.ts             # Order ISC rows, assign capabilities
│   ├── BuildPhase.ts            # Refine ISC rows for testability
│   ├── ExecutePhase.ts          # FR-5: Agent orchestration
│   ├── VerifyPhase.ts           # FR-6: Verification system
│   └── LearnPhase.ts            # Output results for user rating
├── Data/
│   ├── capabilities.yaml       # Capability registry (effort → capabilities)
│   ├── verification-methods.yaml # Verification method definitions
│   └── phase-config.yaml       # Phase configuration and gates
└── Integration/
    ├── MemoryIntegration.ts     # FR-7: Memory system integration
    ├── CoreIntegration.ts       # User preferences and context
    └── AgentsIntegration.ts     # Agent orchestration interface
```

### ISC Data Structure (TC-4)
```typescript
interface ISCRow {
  id: number;
  description: string;           // What ideal looks like
  source: 'EXPLICIT' | 'INFERRED' | 'IMPLICIT';
  capability?: string;           // Assigned capability (e.g., 'research.perplexity')
  status: 'PENDING' | 'ACTIVE' | 'DONE' | 'BLOCKED' | 'ADJUSTED';
  verificationMethod?: string;   // How to verify completion
  verificationCriteria?: string; // Specific criteria for verification
  claimedBy?: string;           // Agent claim for race condition prevention
  claimedAt?: Date;             // Claim timestamp for stale detection
  completedAt?: Date;           // Completion timestamp
  verifiedAt?: Date;            // Verification timestamp
  notes?: string;               // Additional context or adjustments
}

interface ISCTable {
  id: string;                   // Unique identifier
  request: string;              // Original user request
  effort: EffortLevel;          // TRIVIAL | QUICK | STANDARD | THOROUGH | DETERMINED
  phase: Phase;                 // Current execution phase
  iteration: number;            // Current iteration count
  rows: ISCRow[];              // ISC rows
  createdAt: Date;
  updatedAt: Date;
}
```

## Core Classes

### EffortClassifier (FR-1)
```typescript
class EffortClassifier {
  classify(request: string, context?: UserContext): EffortLevel {
    // Analyze complexity indicators:
    // - Multi-step requirements
    // - File modification scope
    // - Research/analysis needs
    // - Integration complexity
    // - User override patterns
  }
  
  override(request: string, effort: EffortLevel): string {
    // Handle explicit effort overrides
    // Pattern: "algorithm effort THOROUGH: build feature"
  }
}
```

### CapabilityLoader (FR-2)
```typescript
class CapabilityLoader {
  loadCapabilities(effort: EffortLevel): AvailableCapabilities {
    // Load from capabilities.yaml based on effort level
    // Return models, thinking modes, research agents, etc.
  }
  
  getCapabilityForRow(rowDescription: string, effort: EffortLevel): string {
    // Select appropriate capability for ISC row
    // Consider row type, effort level, and availability
  }
}
```

### ISCManager (FR-3)
```typescript
class ISCManager {
  create(request: string, context: UserContext): ISCTable {
    // Create ISC with explicit, inferred, implicit requirements
    // Integrate with Memory for historical patterns (FR-7)
  }
  
  addRow(iscId: string, description: string, source: RowSource): void {
    // Add new ISC row with verification method pairing
  }
  
  claimRow(iscId: string, rowId: number, agentId: string): boolean {
    // Claim row for agent execution (prevent race conditions)
  }
  
  updateStatus(iscId: string, rowId: number, status: RowStatus): void {
    // Update row status with timestamp tracking
  }
  
  getAvailableRows(iscId: string): ISCRow[] {
    // Get unclaimed, pending rows for agent assignment
  }
}
```

### PhaseEngine (FR-4)
```typescript
class PhaseEngine {
  async executePhase(phase: Phase, iscId: string): Promise<PhaseResult> {
    // Execute specific phase with entry/exit criteria
    // Handle phase transitions and gate validation
  }
  
  async runAlgorithm(request: string, effort?: EffortLevel): Promise<AlgorithmResult> {
    // Main algorithm execution loop
    // OBSERVE → THINK → PLAN → BUILD → EXECUTE → VERIFY → LEARN
  }
  
  private async checkGate(phase: Phase, iscId: string): Promise<boolean> {
    // Validate phase completion criteria before transition
  }
}
```

## Integration Points

### Memory Integration (FR-7)
```typescript
// In MemoryIntegration.ts
class MemoryIntegration {
  async getUserContext(userId: string): Promise<UserContext> {
    // Query Memory v0.3 for user preferences, patterns, history
  }
  
  async storeISCArtifact(iscTable: ISCTable): Promise<void> {
    // Store ISC and results in Memory for future reference
  }
  
  async getHistoricalPatterns(request: string): Promise<ISCPattern[]> {
    // Retrieve similar past ISCs for pattern matching
  }
}
```

### Agents Integration (FR-5)
```typescript
// In AgentsIntegration.ts
class AgentsIntegration {
  async spawnAgent(capability: string, iscRow: ISCRow): Promise<Agent> {
    // Create agent using Agents v0.5 system
    // Configure with appropriate traits and model
  }
  
  async orchestrateParallel(rows: ISCRow[], maxConcurrent: number): Promise<void> {
    // Manage parallel agent execution within effort limits (NFR-2)
  }
  
  async getVerificationAgent(executorAgent: Agent): Promise<Agent> {
    // Create different agent for verification (objectivity requirement)
  }
}
```

## Database Schema Changes

### ISC Storage
```sql
-- ISC tables stored in ~/.kiro/data/algorithm/
CREATE TABLE isc_tables (
  id TEXT PRIMARY KEY,
  request TEXT NOT NULL,
  effort TEXT NOT NULL,
  phase TEXT NOT NULL,
  iteration INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE isc_rows (
  id INTEGER PRIMARY KEY,
  isc_id TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  capability TEXT,
  status TEXT DEFAULT 'PENDING',
  verification_method TEXT,
  verification_criteria TEXT,
  claimed_by TEXT,
  claimed_at DATETIME,
  completed_at DATETIME,
  verified_at DATETIME,
  notes TEXT,
  FOREIGN KEY (isc_id) REFERENCES isc_tables(id)
);
```

## Algorithms and Logic

### Phase Execution Algorithm
```typescript
class PhaseExecutor {
  async executeObserve(iscId: string): Promise<void> {
    // 1. Parse request for explicit requirements
    // 2. Query Memory for user context and inferred requirements
    // 3. Add implicit requirements (security, quality, testing)
    // 4. Create ISC rows with verification methods
    // Gate: Minimum 2 rows created, context utilized
  }
  
  async executeThink(iscId: string): Promise<void> {
    // 1. Review ISC for completeness
    // 2. Use thinking capabilities to identify missing requirements
    // 3. Add discovered requirements as new ISC rows
    // Gate: All rows clear and testable
  }
  
  async executePlan(iscId: string): Promise<void> {
    // 1. Order ISC rows by dependencies
    // 2. Assign capabilities to each row
    // 3. Plan parallel execution groups
    // Gate: Dependencies mapped, capabilities assigned
  }
  
  async executeBuild(iscId: string): Promise<void> {
    // 1. Refine ISC rows for specificity
    // 2. Ensure verification criteria are testable
    // 3. Prepare execution context for agents
    // Gate: Each row specific enough to verify
  }
  
  async executeExecute(iscId: string): Promise<void> {
    // 1. Spawn agents for each capability type
    // 2. Manage parallel execution within effort limits
    // 3. Handle agent claims and status updates
    // Gate: Every row has final status
  }
  
  async executeVerify(iscId: string): Promise<void> {
    // 1. Create verification agents (different from executors)
    // 2. Test each DONE row against verification criteria
    // 3. Update status based on verification results
    // Gate: Tested/confirmed each completion
  }
  
  async executeLearn(iscId: string): Promise<void> {
    // 1. Compile results and artifacts
    // 2. Present to user for rating
    // 3. Store in Memory for future reference
    // Gate: User rates for memory system
  }
}
```

### Iteration Logic (FR-8)
```typescript
class IterationManager {
  async handleVerificationFailure(iscId: string, failedRows: ISCRow[]): Promise<Phase> {
    // Determine appropriate loop-back phase:
    // - Unclear requirements → THINK
    // - Wrong approach → PLAN  
    // - Execution error → EXECUTE
    
    const maxIterations = this.getMaxIterations(effort);
    if (currentIteration >= maxIterations) {
      throw new Error('Maximum iterations exceeded');
    }
    
    return this.determineLoopBackPhase(failedRows);
  }
  
  private getMaxIterations(effort: EffortLevel): number {
    // QUICK: 1, STANDARD: 2, THOROUGH: 3-5, DETERMINED: unlimited
  }
}
```

## Configuration

### Default Settings
```yaml
# phase-config.yaml
phases:
  observe:
    min_rows: 2
    require_context: true
    timeout_seconds: 300
  
  think:
    thinking_modes: ['deep_thinking', 'first_principles']
    completeness_threshold: 0.9
    timeout_seconds: 600
  
  execute:
    parallel_limits:
      QUICK: 1
      STANDARD: 3
      THOROUGH: 5
      DETERMINED: 10
    claim_timeout_minutes: 30
    
  verify:
    require_different_agent: true
    verification_threshold: 0.85
    
iteration:
  max_iterations:
    QUICK: 1
    STANDARD: 2
    THOROUGH: 5
    DETERMINED: -1  # unlimited
```

## Monitoring and Observability

### Metrics (NFR-4)
```typescript
// Algorithm execution metrics
algorithm_executions_total{effort, phase, status}
algorithm_duration_seconds{effort, phase}
isc_rows_total{effort, source, status}
agent_utilization{capability, effort}
verification_pass_rate{effort, method}
memory_integration_success_rate
```

### Logging
```typescript
logger.info("Algorithm started", {
  request: request,
  effort: effort,
  iscId: iscId,
  phase: "OBSERVE"
});

logger.info("ISC row completed", {
  iscId: iscId,
  rowId: rowId,
  capability: capability,
  duration: duration,
  status: "DONE"
});
```

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1-2)
1. Implement ISCManager and data structures
2. Create EffortClassifier with basic complexity analysis
3. Build CapabilityLoader with yaml configuration
4. Set up integration interfaces for Memory, CORE, Agents

### Phase 2: Phase Engine (Week 3-4)
1. Implement PhaseEngine with basic phase execution
2. Create individual phase executors (Observe, Think, Plan, Build)
3. Add phase transition logic and gate validation
4. Implement iteration management

### Phase 3: Agent Orchestration (Week 5-6)
1. Integrate with Agents v0.5 for agent spawning
2. Implement parallel execution with concurrency limits
3. Add agent claim system for race condition prevention
4. Create verification system with different agents

### Phase 4: Memory Integration (Week 7-8)
1. Integrate with Memory v0.3 for context retrieval
2. Implement ISC artifact storage
3. Add historical pattern matching
4. Create learning phase with user rating capture

## Testing Strategy

### Unit Tests
- ISCManager operations (create, update, claim, release)
- EffortClassifier accuracy across request types
- Phase execution logic and gate validation
- Agent orchestration and concurrency management

### Integration Tests
- End-to-end algorithm execution for each effort level
- Memory integration for context and storage
- Agents integration for parallel execution
- CORE integration for user preferences

### Property-Based Tests
- ISC table consistency across phase transitions
- Agent claim system prevents race conditions
- Verification uses different agents than executors
- Iteration bounds respected by effort level

## Performance Considerations

### Execution Performance (NFR-1)
- QUICK tasks complete within 30 seconds
- Parallel agent execution for STANDARD+ efforts
- Efficient ISC row querying and updates
- Memory integration caching for repeated context queries

### Concurrency Management (NFR-2)
- Effort-based parallel limits enforced
- Agent claim system prevents resource conflicts
- Graceful degradation when agents unavailable
- Background execution for long-running tasks

### Memory Efficiency
- ISC tables stored efficiently in SQLite
- Agent lifecycle management to prevent memory leaks
- Cleanup of completed algorithm artifacts
- Efficient serialization of complex data structures