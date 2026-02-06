# Kiro Memory System - Deployment Guide

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] AWS account with Bedrock access
- [ ] Amazon Titan Embeddings V2 model enabled
- [ ] AWS credentials configured (SSO, IAM, or env vars)
- [ ] IAM permissions for `bedrock:InvokeModel`
- [ ] Bun runtime installed
- [ ] Kiro CLI installed and configured

## Installation Steps

### 1. Clone/Copy Memory System

```bash
cd ~/src/kiro/kiro-infrastructure
# Memory system is in: memory/
```

### 2. Install Dependencies

```bash
cd memory

# If behind corporate proxy:
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt bun install

# Otherwise:
bun install
```

### 3. Configure AWS Credentials

Choose one method:

**Option A: AWS SSO (Recommended)**
```bash
aws sso login --profile your-profile
export AWS_PROFILE=your-profile
export AWS_REGION=us-east-2
```

**Option B: Environment Variables**
```bash
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
export AWS_REGION=us-east-2
```

**Option C: AWS Config Files**
```bash
aws configure
# Enter credentials when prompted
```

### 4. Enable Bedrock Model Access

1. Go to AWS Console → Amazon Bedrock
2. Navigate to "Model access"
3. Click "Manage model access"
4. Enable: **Amazon Titan Embeddings V2**
5. Submit request (usually instant approval)

### 5. Verify Setup

```bash
# Test basic functionality
bun test/smoke.ts

# Run full test suite (requires AWS credentials)
AWS_PROFILE=your-profile AWS_REGION=us-east-2 bun test
```

Expected output:
```
✅ 19/19 tests passing
```

### 6. Process Existing Journals

```bash
# Process all journals in ~/.kiro/journals/
bun run process
```

Expected output:
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
   Duration: 5.2s
```

### 7. Test Query Functionality

```bash
bun run query "authentication" 3
```

Expected output:
```
🔍 Searching memory for: "authentication"

Found 2 result(s):

1. Fixed authentication bug in login flow
   Similarity: 34.1%
   ...
```

## Optional: Auto-Processing Hook

To automatically process journals after each chat session:

### 1. Copy Hook

```bash
# Hook should already be at:
ls ~/.kiro/hooks/AutoProcessMemory.hook.ts
```

### 2. Configure Agent

Add to your agent config (`~/.kiro/agents/default.json` or your agent):

```json
{
  "name": "default",
  "hooks": {
    "agentEnd": [
      {
        "command": "/home/YOUR_USERNAME/.kiro/hooks/AutoProcessMemory.hook.ts"
      }
    ]
  }
}
```

**Important:** Replace `YOUR_USERNAME` with your actual username.

### 3. Test Hook

```bash
# Simulate agentEnd event
echo '{"hook_event_name":"agentEnd"}' | ~/.kiro/hooks/AutoProcessMemory.hook.ts
echo "Exit code: $?"
```

Expected: Exit code 0 (silent success)

## Environment Variables

Set these in your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
# Required
export AWS_PROFILE=your-profile
export AWS_REGION=us-east-2

# Optional (defaults shown)
export KIRO_JOURNAL_PATH=~/.kiro/journals
export KIRO_MEMORY_PATH=~/.kiro/memory/vectra
```

## Directory Structure

After deployment:

```
~/.kiro/
├── journals/              # WorkCapture output
│   ├── 2026-02-01.md
│   ├── 2026-02-02.md
│   └── ...
├── memory/
│   └── vectra/           # Vector index (auto-created)
│       ├── index.json
│       └── ...
└── hooks/
    └── AutoProcessMemory.hook.ts
```

## Verification Checklist

After deployment, verify:

- [ ] `bun test` passes all tests
- [ ] `bun run process` indexes journals successfully
- [ ] `bun run query "test"` returns results
- [ ] `bun run stats` shows correct entry count
- [ ] Auto-processing hook (if configured) runs without errors

## Performance Expectations

Based on benchmarks:

- **Processing:** ~220ms per entry
- **Querying:** ~330ms average
- **Stats:** <1ms
- **Throughput:** ~4.5 entries/sec

For 100 journal entries:
- Processing time: ~22 seconds
- Cost: $0.001 (one-time)

## Cost Management

**Indexing:**
- $0.01 per 1,000 entries (one-time)
- 100 entries = $0.001
- 10,000 entries = $0.10

**Querying:**
- $0.00001 per query
- 1,000 queries = $0.01

**Typical monthly cost:** <$0.10 for most users

## Troubleshooting

### "Your session has expired"

```bash
aws sso login --profile your-profile
```

### "Access denied to model"

Enable Bedrock model access in AWS Console:
1. Bedrock → Model access
2. Enable "Amazon Titan Embeddings V2"

### "No such file or directory: ~/.kiro/journals"

Create journals directory:
```bash
mkdir -p ~/.kiro/journals
```

Or ensure WorkCapture hook is configured.

### "Certificate verification failed"

Use corporate certificates:
```bash
NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt bun install
```

### Tests failing

Check AWS credentials:
```bash
aws sts get-caller-identity --profile your-profile
```

Verify Bedrock access:
```bash
aws bedrock list-foundation-models --region us-east-2 --profile your-profile
```

## Maintenance

### Weekly

```bash
# Process new journals
cd ~/src/kiro/kiro-infrastructure/memory
bun run process
```

### Monthly

```bash
# View statistics
bun run stats

# Check index size
du -sh ~/.kiro/memory/vectra
```

### As Needed

```bash
# Re-index all journals (if needed)
rm -rf ~/.kiro/memory/vectra
bun run process
```

## Backup

The memory index is stored locally. To backup:

```bash
# Backup index
tar -czf kiro-memory-backup-$(date +%Y%m%d).tar.gz ~/.kiro/memory/

# Restore
tar -xzf kiro-memory-backup-YYYYMMDD.tar.gz -C ~/
```

## Upgrading

To upgrade to a new version:

```bash
cd ~/src/kiro/kiro-infrastructure/memory
git pull  # or copy new files
bun install
bun test  # verify
```

No re-indexing needed unless index format changes.

## Support

For issues:
1. Check troubleshooting section above
2. Review logs in terminal output
3. Verify AWS credentials and permissions
4. Test with `bun test/smoke.ts`

## Next Steps

After deployment:
1. Process your existing journals
2. Try semantic search queries
3. Configure auto-processing hook (optional)
4. Integrate with THEALGORITHM (v0.6) when available
