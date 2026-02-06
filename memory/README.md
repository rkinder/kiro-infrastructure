# Kiro Memory System v0.3

Semantic memory storage and retrieval using **Vectra** (embedded vector DB) + **AWS Bedrock** (embeddings).

## Status

**✅ Phase 1:** Foundation  
**✅ Phase 2:** Journal Processing  
**✅ Phase 3:** Integration & Tools  
**Next:** Phase 4 - Testing & Documentation

## Quick Start

```bash
# 1. Setup AWS credentials
export AWS_PROFILE=your-profile
export AWS_REGION=us-east-2

# 2. Install
cd memory
bun install

# 3. Process journals
bun run process

# 4. Search memory
bun run query "authentication bugs" 5

# 5. View stats
bun run stats
```

## Features

✅ Semantic search with AI embeddings  
✅ Fully embedded (no servers)  
✅ AWS Bedrock integration  
✅ Fast (~1s per 3 entries)  
✅ Cheap ($0.01 per 1,000 entries)  
✅ CLI tools + API  
✅ Auto-processing hook  
✅ 16/16 tests passing

## CLI Commands

```bash
bun run process              # Index all journals
bun run query "text" [limit] # Semantic search
bun run rate <id> <1-5>      # Rate a session
bun run stats                # View statistics
```

## Documentation

- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete usage guide
- **[BEDROCK_INTEGRATION.md](BEDROCK_INTEGRATION.md)** - Architecture details
- **[PHASE2_COMPLETE.md](PHASE2_COMPLETE.md)** - Journal processing
- **[PHASE3_COMPLETE.md](PHASE3_COMPLETE.md)** - Integration & tools

## Prerequisites

1. **AWS Bedrock Access** - Enable "Amazon Titan Embeddings V2"
2. **AWS Credentials** - SSO, IAM, or environment variables
3. **Bun Runtime** - `curl -fsSL https://bun.sh/install | bash`

See [USER_GUIDE.md](USER_GUIDE.md) for detailed setup.

## Cost

$0.01 per 1,000 journal entries (one-time indexing)  
$0.00001 per query

Example: 10,000 entries = $0.10 total
