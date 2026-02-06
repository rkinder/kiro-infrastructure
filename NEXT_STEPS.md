# Next Steps

## Immediate Actions

### 1. Push to GitHub
```bash
cd ~/src/kiro/kiro-infrastructure
gh repo create kiro-infrastructure --public --source=. --remote=origin
git push -u origin master
```

### 2. Start v0.2 Development (Hook System)

**Create hooks directory structure:**
```bash
cd ~/src/kiro/kiro-infrastructure
mkdir -p hooks/{examples,tests}
```

**Priority hooks to implement:**
1. `load-context.sh` - Auto-load TELOS skill
2. `security-validator.sh` - Block dangerous commands
3. `telos-auto-update.sh` - Auto-backup on fs_write
4. `update-tab-title.sh` - Dynamic terminal title
5. `work-capture.sh` - Log completed work

**Estimated effort:** ~8 hours

### 3. Reference PAI Sparingly

**Only open PAI files when:**
- Porting a specific hook implementation
- Checking exact command patterns
- Understanding workflow logic

**Use this command:**
```bash
# Read specific PAI hook
cat ~/src/claude/Personal_AI_Infrastructure/Releases/v2.5/.claude/hooks/LoadContext.hook.ts
```

**Don't:**
- Load entire PAI directory
- Browse PAI in this session
- Keep PAI files open "just in case"

## Development Workflow

### For Each Hook:
1. **Read PAI implementation** (targeted file read)
2. **Adapt to bash** (simplify, remove TypeScript)
3. **Test in isolation** (verify it works)
4. **Document** (add to CHANGELOG.md)
5. **Commit** (one hook per commit)

### Example Session:
```bash
# 1. Read PAI hook
cat ~/src/claude/Personal_AI_Infrastructure/Releases/v2.5/.claude/hooks/LoadContext.hook.ts

# 2. Create Kiro version
cat > hooks/load-context.sh << 'EOF'
#!/bin/bash
# Load TELOS skill on agent spawn
cat ~/.kiro/skills/telos/skill.md
EOF

# 3. Test
chmod +x hooks/load-context.sh
./hooks/load-context.sh

# 4. Commit
git add hooks/load-context.sh
git commit -m "Add load-context hook"
```

## Token Efficiency

**Before split:**
- PAI repo: 2,827 files, 489MB
- Every operation scanned entire PAI codebase

**After split:**
- Kiro repo: 38 files, ~50KB
- **99% reduction in context size**

**Benefit:**
- Faster operations
- Lower token costs
- Clearer focus
- Easier collaboration

## Questions?

See `docs/PORTING_GUIDE.md` for detailed porting workflow.
