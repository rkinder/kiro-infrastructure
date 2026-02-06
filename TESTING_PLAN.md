# v0.2 Hook System - Testing Plan

## Pre-Test Verification

Before restarting Kiro CLI, verify deployment:

```bash
# Check hooks are installed
ls -lh ~/.kiro/hooks/*.hook.ts

# Check configuration exists
cat ~/.kiro/config/hooks.yaml

# Check directories created
ls -ld ~/.kiro/{backups/telos,journals,logs}

# Run unit tests
cd ~/.kiro/hooks && bun test
```

Expected: All 5 hooks present, config file exists, directories created, 15 tests pass.

---

## Test 1: LoadContext Hook (SessionStart)

**Objective**: Verify TELOS context loads automatically at session start

**Steps**:
1. Exit current Kiro session: `/quit`
2. Start new session: `kiro-cli chat`
3. In first message, ask: "What are my core beliefs?"

**Expected Result**:
- I should reference your TELOS BELIEFS without you providing them
- Should mention "standing on shoulders of giants" principle
- Response should be contextually aware of your identity

**Pass Criteria**: ✅ I demonstrate knowledge of your TELOS context without you explicitly providing it

---

## Test 2: SecurityValidator Hook (PreToolUse)

**Objective**: Verify dangerous commands are blocked/confirmed

**Steps**:
1. Ask me to run: `git push --force`
2. Observe if I warn about force push
3. Ask me to run: `ls -la` (safe command)
4. Observe if it executes normally

**Expected Result**:
- Force push should trigger warning/confirmation
- Safe commands should execute without intervention
- Security decisions logged to `~/.kiro/logs/hooks.log`

**Pass Criteria**: ✅ Dangerous commands flagged, safe commands pass through

**Verification**:
```bash
# Check security log
tail ~/.kiro/logs/hooks.log | grep -i security
```

---

## Test 3: TelosAutoUpdate Hook (PostToolUse)

**Objective**: Verify TELOS files are auto-backed up on modification

**Steps**:
1. Ask me to update your TELOS: "Add to my GOALS: Learn Rust programming"
2. Check if backup was created
3. Verify change was logged

**Expected Result**:
- Backup file created in `~/.kiro/backups/telos/`
- Backup filename includes timestamp
- Change logged in `~/.kiro/context/telos/updates.md`

**Pass Criteria**: ✅ Backup exists, change logged, original file updated

**Verification**:
```bash
# Check backups
ls -lt ~/.kiro/backups/telos/ | head -5

# Check change log
tail ~/.kiro/context/telos/updates.md

# Verify backup integrity
diff ~/.kiro/context/telos/GOALS.md ~/.kiro/backups/telos/GOALS-*.md
```

---

## Test 4: UpdateTabTitle Hook (OnContextChange)

**Objective**: Verify terminal title updates based on context

**Steps**:
1. Start new session
2. Observe terminal tab/window title
3. Switch to different project context
4. Observe if title updates

**Expected Result**:
- Title shows "Kiro" at minimum
- Title includes project/task context when available
- Title updates dynamically

**Pass Criteria**: ✅ Terminal title reflects current context

**Note**: This test depends on Kiro CLI triggering OnContextChange events. May not be visible if Kiro doesn't implement this trigger yet.

---

## Test 5: WorkCapture Hook (SessionEnd)

**Objective**: Verify work is logged to daily journal

**Steps**:
1. Complete some work in session (e.g., create a file)
2. Exit session: `/quit`
3. Check if work was captured

**Expected Result**:
- Journal file created: `~/.kiro/journals/YYYY-MM-DD.md`
- Entry includes timestamp, task, outcome
- Files modified are listed

**Pass Criteria**: ✅ Journal entry exists with session work

**Verification**:
```bash
# Check today's journal
cat ~/.kiro/journals/$(date +%Y-%m-%d).md

# List all journals
ls -lt ~/.kiro/journals/
```

---

## Test 6: Error Resilience

**Objective**: Verify hooks fail gracefully without breaking Kiro

**Steps**:
1. Temporarily rename TELOS directory: `mv ~/.kiro/context/telos ~/.kiro/context/telos.bak`
2. Start new Kiro session
3. Verify session starts despite missing TELOS
4. Restore directory: `mv ~/.kiro/context/telos.bak ~/.kiro/context/telos`

**Expected Result**:
- Kiro session starts successfully
- Warning logged about missing TELOS
- No crash or error messages to user

**Pass Criteria**: ✅ Graceful degradation, session continues

**Verification**:
```bash
# Check error log
tail ~/.kiro/logs/hooks.log | grep -i error
```

---

## Test 7: Performance Check

**Objective**: Verify hooks don't slow down Kiro CLI

**Steps**:
1. Time session startup: `time kiro-cli chat` (then immediately `/quit`)
2. Disable hooks: `mv ~/.kiro/hooks ~/.kiro/hooks.disabled`
3. Time session startup again
4. Re-enable hooks: `mv ~/.kiro/hooks.disabled ~/.kiro/hooks`

**Expected Result**:
- Hook overhead < 200ms
- No noticeable delay in session start

**Pass Criteria**: ✅ Startup time difference < 200ms

---

## Test 8: Configuration Override

**Objective**: Verify configuration changes are respected

**Steps**:
1. Edit `~/.kiro/config/hooks.yaml`
2. Set `security.enabled: false`
3. Restart Kiro session
4. Try dangerous command (should not be blocked)
5. Restore `security.enabled: true`

**Expected Result**:
- Security validation disabled when configured
- Changes take effect on session restart

**Pass Criteria**: ✅ Configuration changes respected

---

## Post-Test Verification

After all tests, verify system state:

```bash
# Check all logs
tail -50 ~/.kiro/logs/hooks.log

# Check backups created
ls -lh ~/.kiro/backups/telos/

# Check journals created
ls -lh ~/.kiro/journals/

# Verify TELOS intact
ls -lh ~/.kiro/context/telos/

# Run unit tests again
cd ~/.kiro/hooks && bun test
```

---

## Known Limitations

1. **Kiro Hook Integration**: These tests assume Kiro CLI has hook trigger points implemented. If hooks don't fire, it's a Kiro CLI integration issue, not a hook implementation issue.

2. **Manual Testing**: Some hooks (UpdateTabTitle, WorkCapture) may require manual verification if Kiro doesn't trigger them automatically.

3. **Trigger Points**: Verify Kiro CLI documentation for actual hook trigger support:
   - SessionStart
   - PreToolUse
   - PostToolUse
   - OnContextChange
   - SessionEnd

---

## Troubleshooting

### Hooks Not Firing
```bash
# Check if Kiro recognizes hooks
kiro-cli --help | grep -i hook

# Test hook manually
bun ~/.kiro/hooks/LoadContext.hook.ts

# Check permissions
ls -l ~/.kiro/hooks/*.hook.ts
```

### Logs Not Created
```bash
# Ensure log directory exists
mkdir -p ~/.kiro/logs

# Check write permissions
touch ~/.kiro/logs/test.log && rm ~/.kiro/logs/test.log
```

### Configuration Not Loading
```bash
# Verify YAML syntax
cat ~/.kiro/config/hooks.yaml

# Test config loading
bun -e "import { loadConfig } from '~/.kiro/hooks/lib/config'; console.log(await loadConfig())"
```

---

## Success Criteria Summary

| Test | Hook | Status |
|------|------|--------|
| 1. Context Loading | LoadContext | ⬜ |
| 2. Security Validation | SecurityValidator | ⬜ |
| 3. Auto Backup | TelosAutoUpdate | ⬜ |
| 4. Title Update | UpdateTabTitle | ⬜ |
| 5. Work Capture | WorkCapture | ⬜ |
| 6. Error Resilience | All | ⬜ |
| 7. Performance | All | ⬜ |
| 8. Configuration | All | ⬜ |

**Overall Pass**: 8/8 tests passing

---

## Next Steps After Testing

1. Document any issues found
2. Create GitHub issues for Kiro CLI integration gaps
3. Optimize based on performance results
4. Add user-requested features
5. Plan v0.3 enhancements
