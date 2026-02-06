#!/bin/bash
# Hook System Test Script
# Tests all three hooks: LoadContext, SecurityValidator, WorkCapture

set -e

HOOKS_DIR="$HOME/.kiro/hooks"
JOURNAL_DIR="$HOME/.kiro/journals"
LOG_FILE="$HOME/.kiro/logs/hooks.log"

echo "🧪 Testing Kiro Hook System"
echo "================================"
echo ""

# Test 1: LoadContext Hook
echo "Test 1: LoadContext Hook (agentSpawn)"
echo "--------------------------------------"
echo "Testing: Does it load TELOS context?"
echo ""

LOAD_INPUT='{"hook_event_name":"agentSpawn","cwd":"'$(pwd)'"}'
LOAD_OUTPUT=$(echo "$LOAD_INPUT" | "$HOOKS_DIR/LoadContext.hook.ts" 2>&1)
LOAD_EXIT=$?

if [ $LOAD_EXIT -eq 0 ] && echo "$LOAD_OUTPUT" | grep -q "TELOS Context"; then
    echo "✅ LoadContext: PASSED"
    echo "   - Exit code: 0"
    echo "   - Output contains TELOS context"
    echo "   - Lines output: $(echo "$LOAD_OUTPUT" | wc -l)"
else
    echo "❌ LoadContext: FAILED"
    echo "   - Exit code: $LOAD_EXIT"
    echo "   - Output: $LOAD_OUTPUT"
fi
echo ""

# Test 2: SecurityValidator Hook
echo "Test 2: SecurityValidator Hook (preToolUse)"
echo "--------------------------------------------"
echo "Testing: Does it validate dangerous commands?"
echo ""

# Test 2a: Safe command
SAFE_INPUT='{"hook_event_name":"preToolUse","cwd":"'$(pwd)'","tool_name":"execute_bash","tool_input":{"command":"ls -la"}}'
SAFE_OUTPUT=$(echo "$SAFE_INPUT" | "$HOOKS_DIR/SecurityValidator.hook.ts" 2>&1)
SAFE_EXIT=$?

if [ $SAFE_EXIT -eq 0 ] && echo "$SAFE_OUTPUT" | grep -q '"continue":true'; then
    echo "✅ SecurityValidator (safe): PASSED"
    echo "   - Command 'ls -la' allowed"
else
    echo "❌ SecurityValidator (safe): FAILED"
    echo "   - Output: $SAFE_OUTPUT"
fi

# Test 2b: Dangerous command
DANGER_INPUT='{"hook_event_name":"preToolUse","cwd":"'$(pwd)'","tool_name":"execute_bash","tool_input":{"command":"rm -rf /"}}'
DANGER_OUTPUT=$(echo "$DANGER_INPUT" | "$HOOKS_DIR/SecurityValidator.hook.ts" 2>&1)
DANGER_EXIT=$?

if echo "$DANGER_OUTPUT" | grep -q '"decision":"block"'; then
    echo "✅ SecurityValidator (dangerous): PASSED"
    echo "   - Command 'rm -rf /' blocked"
else
    echo "❌ SecurityValidator (dangerous): FAILED"
    echo "   - Output: $DANGER_OUTPUT"
fi

# Test 2c: Risky command (needs confirmation)
RISKY_INPUT='{"hook_event_name":"preToolUse","cwd":"'$(pwd)'","tool_name":"execute_bash","tool_input":{"command":"git push --force"}}'
RISKY_OUTPUT=$(echo "$RISKY_INPUT" | "$HOOKS_DIR/SecurityValidator.hook.ts" 2>&1)
RISKY_EXIT=$?

if echo "$RISKY_OUTPUT" | grep -q '"decision":"ask"'; then
    echo "✅ SecurityValidator (risky): PASSED"
    echo "   - Command 'git push --force' requires confirmation"
else
    echo "❌ SecurityValidator (risky): FAILED"
    echo "   - Output: $RISKY_OUTPUT"
fi
echo ""

# Test 3: WorkCapture Hook
echo "Test 3: WorkCapture Hook (stop)"
echo "--------------------------------"
echo "Testing: Does it capture work sessions?"
echo ""

# Create test journal entry
TEST_DATE=$(date +%Y-%m-%d)
WORK_INPUT='{"hook_event_name":"stop","cwd":"'$(pwd)'","session_id":"test-'$(date +%s)'","task":"Test hook system","outcome":"All hooks tested successfully","files_modified":["~/.kiro/agents/default.json","~/.kiro/agents/coding.json"]}'
WORK_OUTPUT=$(echo "$WORK_INPUT" | "$HOOKS_DIR/WorkCapture.hook.ts" 2>&1)
WORK_EXIT=$?

if [ $WORK_EXIT -eq 0 ] && echo "$WORK_OUTPUT" | grep -q '"continue":true'; then
    echo "✅ WorkCapture: PASSED"
    echo "   - Exit code: 0"
    echo "   - Work logged successfully"
    
    # Check if journal file was created
    JOURNAL_FILE="$JOURNAL_DIR/$TEST_DATE.md"
    if [ -f "$JOURNAL_FILE" ]; then
        echo "   - Journal file created: $JOURNAL_FILE"
        echo "   - Last entry:"
        tail -10 "$JOURNAL_FILE" | sed 's/^/     /'
    else
        echo "   ⚠️  Journal file not found (may need directory creation)"
    fi
else
    echo "❌ WorkCapture: FAILED"
    echo "   - Exit code: $WORK_EXIT"
    echo "   - Output: $WORK_OUTPUT"
fi
echo ""

# Test 4: Check hook logs
echo "Test 4: Hook Logging"
echo "--------------------"
echo "Testing: Are hooks logging properly?"
echo ""

if [ -f "$LOG_FILE" ]; then
    echo "✅ Hook log exists: $LOG_FILE"
    echo "   Recent entries:"
    tail -5 "$LOG_FILE" | sed 's/^/   /'
else
    echo "⚠️  No hook log found at $LOG_FILE"
fi
echo ""

# Summary
echo "================================"
echo "🎯 Test Summary"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Start a new Kiro CLI session: kiro-cli chat"
echo "2. Ask about your project philosophy (tests LoadContext)"
echo "3. Try running a bash command (tests SecurityValidator)"
echo "4. Complete a task and end session (tests WorkCapture)"
echo ""
echo "Check logs at: $LOG_FILE"
echo "Check journals at: $JOURNAL_DIR/"
echo ""
