# Kiro Memory System - User Guide

## Quick Start

### 1. Setup

Ensure you have AWS credentials configured:

```bash
export AWS_PROFILE=your-profile
export AWS_REGION=us-east-2
```

### 2. Process Your Journals

Index all your work journals into memory:

```bash
cd memory
bun run process
```

Output:
```
🧠 Kiro Memory System - Journal Processor

Journal Path: /home/user/.kiro/journals
Index Path: /home/user/.kiro/memory/vectra
AWS Region: us-east-2

Initializing Vectra index...
Processing journals...

✅ Complete!
   Files processed: 5
   Entries indexed: 23
   Duration: 7.2s
```

### 3. Search Your Memory

Find similar past work:

```bash
bun run query "authentication bugs" 5
```

Output:
```
🔍 Searching memory for: "authentication bugs"

Found 3 result(s):

1. Fixed authentication bug in login flow
   Similarity: 34.1%
   Outcome: Successfully resolved issue...
   Sentiment: neutral
   Files: src/auth/validator.ts
   Time: 2/6/2026, 4:30:00 AM
```

### 4. View Statistics

```bash
bun run stats
```

Output:
```
📊 Kiro Memory System - Statistics

Total Entries: 23

📈 Recent Work:
  1. ✅ Implemented user profile caching
     2/6/2026
  2. ➖ Refactored database connection pool
     2/6/2026
```

## CLI Tools

### process-journals.ts

Batch process all journals in `~/.kiro/journals/`:

```bash
bun tools/process-journals.ts

# Or with custom paths:
KIRO_JOURNAL_PATH=/custom/path bun tools/process-journals.ts
```

**Environment Variables:**
- `KIRO_JOURNAL_PATH` - Journal directory (default: `~/.kiro/journals`)
- `KIRO_MEMORY_PATH` - Index directory (default: `~/.kiro/memory/vectra`)
- `AWS_REGION` - AWS region (default: `us-east-2`)
- `AWS_PROFILE` - AWS profile to use

### query-memory.ts

Semantic search across your work history:

```bash
bun tools/query-memory.ts "your query" [limit]

# Examples:
bun tools/query-memory.ts "database performance" 3
bun tools/query-memory.ts "authentication issues"
bun tools/query-memory.ts "caching optimization" 10
```

**Arguments:**
- `query` (required) - Search query
- `limit` (optional) - Max results (default: 5)

### rate-memory.ts

Rate a work session (1-5 stars):

```bash
bun tools/rate-memory.ts <session-id> <rating>

# Example:
bun tools/rate-memory.ts 2026-02-06T09:30:00Z 5
```

This adds a rating to the journal entry and shows instructions to re-index.

### stats.ts

View memory statistics:

```bash
bun tools/stats.ts
```

Shows:
- Total entries indexed
- Recent work with sentiment indicators
- Quick overview of your work history

## Memory API

For programmatic access:

```typescript
import { MemoryAPI } from './lib/memoryAPI';

const api = new MemoryAPI();

// Search for similar work
const results = await api.querySimilarWork('authentication', 5);

// Get statistics
const stats = await api.getStats();
console.log(`Total entries: ${stats.total}`);

// Query by outcome
const successful = await api.queryByOutcome('success', 10);

// Get positive examples
const positive = await api.getPositiveExamples(5);
```

## Automatic Processing

To automatically process journals after each chat session, add the hook to your agent config:

```json
{
  "hooks": {
    "agentEnd": [
      {
        "command": "/home/user/.kiro/hooks/AutoProcessMemory.hook.ts"
      }
    ]
  }
}
```

This runs silently in the background after each session.

## Use Cases

### 1. Find Similar Past Work

When starting a new task, search for similar work you've done:

```bash
bun run query "implement caching layer" 3
```

Review past approaches, files modified, and outcomes.

### 2. Learn from Mistakes

Find past issues to avoid repeating them:

```bash
bun run query "memory leak database" 5
```

### 3. Track Progress

See your work history and patterns:

```bash
bun run stats
```

### 4. Context for AI

Use memory results to provide context to AI assistants about your past work.

## Performance

- **Indexing:** ~300ms per entry (Bedrock API)
- **Querying:** ~200ms (embedding) + <1ms (search)
- **Storage:** ~4KB per entry

## Cost

**Bedrock Titan Embeddings V2:**
- Indexing: $0.01 per 1,000 entries (one-time)
- Queries: $0.00001 per query

**Example:** 10,000 entries + 1,000 queries = $0.11 total

## Troubleshooting

### "Your session has expired"

Refresh AWS credentials:
```bash
aws sso login --profile your-profile
```

### "No entries found"

Process your journals first:
```bash
bun run process
```

### "Malformed input request"

Ensure query is not empty:
```bash
# Bad:
bun run query ""

# Good:
bun run query "authentication"
```

### Certificate errors

Use corporate certificates:
```bash
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt bun install
```

## Tips

1. **Process regularly** - Run `bun run process` weekly or use the auto-processing hook
2. **Be specific** - Better queries get better results ("auth token validation" vs "auth")
3. **Use limits** - Start with 3-5 results, increase if needed
4. **Review sentiment** - Learn from positive outcomes, avoid negative patterns
5. **Rate important work** - Use ratings to highlight significant sessions

## Next Steps

- Set up auto-processing hook for automatic indexing
- Integrate with THEALGORITHM skill (v0.6)
- Use memory API in custom tools
- Export memory for analysis
