# TELOS Skill

**Purpose:** Manage personal life context (goals, beliefs, projects, wisdom) with automatic backups and change tracking.

---

## What This Skill Does

TELOS (Telic Evolution and Life Operating System) helps you maintain persistent context about:
- Your goals and aspirations
- Core beliefs and principles
- Active projects
- Lessons learned
- Accumulated wisdom
- Books, movies, and more

---

## Workflow Routing

When user says these phrases, execute the corresponding workflow:

| Trigger Phrases | Workflow | File |
|----------------|----------|------|
| "add to TELOS", "update my goals", "add this book", "record this in TELOS" | Update | `workflows/update.md` |

---

## Files Managed

All files located at `~/.kiro/context/telos/`:

| File | Purpose |
|------|---------|
| BELIEFS.md | Core beliefs and principles |
| BOOKS.md | Reading list and favorite books |
| CHALLENGES.md | Current obstacles and challenges |
| FRAMES.md | Conceptual perspectives |
| GOALS.md | Life goals and objectives |
| LESSONS.md | Lessons learned over time |
| MISSION.md | Personal mission statement |
| MODELS.md | Mental models and frameworks |
| MOVIES.md | Film recommendations |
| NARRATIVES.md | Key stories and themes |
| PREDICTIONS.md | Future predictions |
| PROBLEMS.md | Problems you're solving |
| PROJECTS.md | Active and planned projects |
| STRATEGIES.md | Approaches to goals |
| TELOS.md | Main framework overview |
| TRAUMAS.md | Past traumas (optional) |
| WISDOM.md | Accumulated wisdom |
| WRONG.md | Things you were wrong about |
| updates.md | Automatic change log |

---

## Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| update-telos.ts | Update TELOS files with backups | `bun tools/update-telos.ts <file> "<content>" "<description>"` |

---

## Examples

### Example 1: Add a Book
```
User: "Add Project Hail Mary to my TELOS books"

Kiro:
1. Recognizes "add to TELOS" + "books" trigger
2. Executes Update workflow
3. Runs: bun update-telos.ts BOOKS.md "- *Project Hail Mary* by Andy Weir" "Added favorite book"
4. Confirms: "Updated your TELOS! Added to BOOKS.md with automatic backup."
```

### Example 2: Update Goals
```
User: "Update my goals: Launch SaaS product by Q2"

Kiro:
1. Recognizes "update my goals" trigger
2. Executes Update workflow
3. Runs: bun update-telos.ts GOALS.md "- Launch SaaS product by Q2 2026" "Added Q2 goal"
4. Confirms: "Updated your GOALS.md with automatic backup."
```

### Example 3: Record Lesson
```
User: "Add this to my lessons: TypeScript + Bun is better than bash for complex tools"

Kiro:
1. Recognizes "add to" + "lessons" trigger
2. Executes Update workflow
3. Formats with date: "### 2026-02-05\n- TypeScript + Bun is better than bash for complex tools"
4. Runs update-telos.ts
5. Confirms: "Recorded in LESSONS.md with timestamp."
```

---

## Requirements

- **Bun runtime** - Install with: `curl -fsSL https://bun.sh/install | bash`
- **TELOS installed** - Files must exist at `~/.kiro/context/telos/`

---

## How It Works

1. **User makes request** with trigger phrase
2. **Kiro recognizes** the trigger and loads this skill
3. **Workflow executes** step-by-step instructions
4. **Tool runs** with automatic backup and logging
5. **User gets confirmation** with file location

---

## Safety Features

- **Automatic backups** - Every change creates timestamped backup
- **Change logging** - All modifications recorded in updates.md
- **Version history** - Backups never overwritten, complete history preserved
- **Validation** - Tool checks file exists and filename is valid

---

## Manual Usage

Users can also run the tool directly:

```bash
# Navigate to tool directory
cd ~/.kiro/skills/telos/tools

# Run update
bun update-telos.ts BOOKS.md "- New Book" "Added book"

# View backups
ls ~/.kiro/context/telos/backups/

# View change log
cat ~/.kiro/context/telos/updates.md
```

---

## Future Enhancements (v0.2+)

- Search across TELOS files
- Context relevance detection
- Automatic context loading at session start
- TELOS dashboard (web UI)
- Export/import functionality
