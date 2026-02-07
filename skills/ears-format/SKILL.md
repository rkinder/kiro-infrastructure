---
name: ears-format
description: EARS (Easy Approach to Requirements Syntax) format for creating specifications. Use when creating requirements documents, design documents, or implementation tasks for software projects.
---

# EARS Format Specification Template

## Prompt Template for Project/Feature Specifications

Use this template to request comprehensive project or feature specifications:

```
Create a [PROJECT/FEATURE NAME] specification using the EARS format. Follow this sequence:
1. Requirements document (EARS format)
2. Design document (referencing EARS requirements)  
3. Implementation tasks (with property tests)

Feature: [Brief description of the feature/project]
Context: [Current system state, problem, or business need]
Goal: [Desired outcome and success criteria]

Create this in .kiro/specs/[feature-name]/ directory with requirements.md, design.md, and tasks.md files.

Use EARS format for all requirements (WHEN/THE system SHALL/IF-THEN/WHILE/WHERE). Each task must include associated property tests that validate the EARS requirements.

After creating the requirements document, ask if I want to proceed to design, or if I have feedback on the requirements first.
```

## Requirements Document Structure (requirements.md)

### Header Format
```markdown
# [Feature Name] Requirements

## Overview
[Brief description of the feature and its purpose]

## Problem Statement
[Clear statement of the problem being solved]
```

### User Stories Section
```markdown
## User Stories

### US-[ID]: [Story Title]
**As a** [user type]  
**I want** [functionality]  
**So that** [benefit/value]

**Acceptance Criteria:**
- [Specific, testable criteria]
- [Additional criteria]
- [More criteria as needed]
```

### Requirements Sections
```markdown
## Functional Requirements

### FR-[ID]: [Requirement Title]
- [Specific functional requirement]
- [Additional details]
- [Implementation notes]

## Non-Functional Requirements

### NFR-[ID]: [Requirement Title]
- [Performance, security, usability requirements]
- [Specific metrics and thresholds]

## Technical Constraints

### TC-[ID]: [Constraint Title]
- [Technical limitations or requirements]
- [Integration constraints]
- [Compatibility requirements]
```

### Supporting Sections
```markdown
## Success Metrics
### [Category] Metrics
- [Specific measurable outcomes]
- [Performance targets]

## Dependencies
- [Internal dependencies]
- [External dependencies]

## Assumptions
- [Key assumptions made]
- [Business assumptions]

## Out of Scope
- [Explicitly excluded items]
- [Future considerations]
```

## Design Document Structure (design.md)

### Header Format
```markdown
# [Feature Name] Design

## Architecture Overview
### Components
```
[Component diagram or description]
```
```

### Database/Schema Changes
```markdown
## Database Schema Changes
### [Table/Entity Name]
```sql
[SQL DDL statements]
```
```

### Core Classes/Modules
```markdown
## Core Classes
### [ClassName]
```python
class [ClassName]:
    def [method_name](self, param: Type) -> ReturnType
    def [another_method](self, param: Type) -> ReturnType
```
```

### Integration Points
```markdown
## Integration Points
### [Integration Name]
```python
# In [existing_module]
[code example showing integration]
```
```

### Algorithms and Logic
```markdown
## [Algorithm/Logic Name]
### [Specific Algorithm]
```python
class [AlgorithmClass]:
    def [algorithm_method](self, input: Type) -> Type:
        [implementation logic]
```
```

### Configuration
```markdown
## Configuration
### Default Settings
```yaml
[configuration_section]:
  [setting]: [value]
  [nested_settings]:
    [sub_setting]: [value]
```
```

### Monitoring and Observability
```markdown
## Monitoring and Observability
### Metrics
```python
# [Metrics description]
[metric_name]{[labels]}
[another_metric]
```

### Logging
```python
# [Logging description]
logger.info("[message]", extra={
    "[field]": [value],
    "[another_field]": [value]
})
```
```

### Implementation Strategy
```markdown
## Migration Strategy
### Phase [N]: [Phase Name]
1. [Step description]
2. [Another step]
3. [Final step]

## Testing Strategy
### Unit Tests
- [Test category]
- [Another test category]

### Integration Tests  
- [Integration test description]
- [Another integration test]

### Property-Based Tests
- [Property description]
- [Another property]

## Performance Considerations
### [Performance Area]
- [Optimization strategy]
- [Performance requirement]
```

## Implementation Tasks Structure (tasks.md)

### Header Format
```markdown
# [Feature Name] Implementation Tasks

## Phase [N]: [Phase Name] (Week [X]-[Y])
```

### Task Format
```markdown
### Task [Phase].[Number]: [Task Title]
**Estimate:** [X] hours  
**Priority:** [High/Medium/Low]

- [ ] [Specific deliverable]
- [ ] [Another deliverable]
- [ ] [Final deliverable]

**Files to modify:**
- `[file_path]`
- `[another_file_path]`

**Files to create:**
- `[new_file_path]`
- `[another_new_file_path]`
```

### Quality Assurance Section
```markdown
## Testing and Quality Assurance

### Task QA.[N]: [Testing Category]
**Estimate:** [X] hours  
**Priority:** [High/Medium/Low]

- [ ] [Test requirement]
- [ ] [Another test requirement]
```

### Deployment Section
```markdown
## Deployment and Rollout

### Task D.[N]: [Deployment Phase]
**Estimate:** [X] hours  
**Priority:** [High/Medium/Low]

- [ ] [Deployment step]
- [ ] [Another deployment step]
```

### Risk and Success Criteria
```markdown
## Risk Mitigation
### High-Risk Tasks
- **[Task name]** - [Risk description and mitigation]

### Mitigation Strategies
- [Strategy description]
- [Another strategy]

## Success Criteria
### Functional
- [ ] [Functional requirement validation]

### Performance  
- [ ] [Performance requirement validation]

### Operational
- [ ] [Operational requirement validation]

## Dependencies
### Internal
- [Internal dependency]

### External
- [External dependency]

## Estimated Total Effort
**Total:** [X] hours (~[Y] person-days)
**Critical Path:** [X] weeks with [N] developer(s)
**Parallel Work:** Can be reduced to [X] weeks with [N] developers
```

## Key Formatting Guidelines

### Code Blocks
- Use appropriate language syntax highlighting
- Include complete, runnable examples where possible
- Show integration points with existing code

### Task Organization
- Group tasks by logical phases
- Include time estimates and priorities
- Specify exact files to modify/create
- Include comprehensive testing tasks

### Requirements Traceability
- Use consistent ID numbering (US-1, FR-1, NFR-1, etc.)
- Reference requirements in design and tasks
- Maintain clear relationships between sections

### Technical Detail Level
- Include specific implementation details
- Show database schema changes
- Provide configuration examples
- Include monitoring and observability

## Usage Instructions

1. **Replace placeholders** in the prompt template with your specific project details
2. **Follow the three-phase approach**: Requirements → Design → Tasks
3. **Request feedback** after each phase before proceeding
4. **Maintain traceability** between requirements, design, and implementation
5. **Include property-based tests** that validate EARS requirements in tasks

## Example Invocation

```
Create a Git Integration MCP Server specification using the EARS format. Follow this sequence:
1. Requirements document (EARS format)
2. Design document (referencing EARS requirements)
3. Implementation tasks (with property tests)

Feature: MCP server providing Git operations for KIRO CLI
Context: KIRO CLI needs Git integration for version control operations within chat sessions
Goal: Enable users to perform Git operations through natural language commands

Create this in .kiro/specs/git-mcp-server/ directory with requirements.md, design.md, and tasks.md files.

Use EARS format for all requirements (WHEN/THE system SHALL/IF-THEN/WHILE/WHERE). Each task must include associated property tests that validate the EARS requirements.

After creating the requirements document, ask if I want to proceed to design, or if I have feedback on the requirements first.
```
