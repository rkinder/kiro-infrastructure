# TELOS Skill for Kiro

A lightweight skill system for managing TELOS life context with automatic backups and change tracking.

---

## What's Included

```
skills/telos/
├── skill.md              # Skill definition with routing table
├── workflows/
│   └── update.md         # Update workflow instructions
└── tools/
    └── update-telos.ts   # TypeScript tool for safe updates
```

---

## Installation

### 1. Install Bun Runtime (if not already installed)

```bash
curl -fsSL https://bun.sh/install | bash
```

Restart your terminal after installation.

### 2. Copy Skills to Kiro Directory

```bash
# Create skills directory
mkdir -p ~/.kiro/skills

# Copy TELOS skill
cp -r skills/telos ~/.kiro/skills/

# Make tool executable
chmod +x ~/.kiro/skills/telos/tools/update-telos.ts
```

### 3. Verify Installation

```bash
# Test the tool
bun ~/.kiro/skills/telos/tools/update-telos.ts

# Should show usage instructions
```

---

## Usage with Kiro

### Automatic (via Skill Routing)

When you say trigger phrases, Kiro will:
1. Recognize the trigger
2. Load the skill
3. Execute the workflow
4. Run the tool

**Example:**
```
You: "Add Project Hail Mary to my TELOS books"

Kiro:
- Recognizes "add to TELOS" + "books"
- Executes Update workflow
- Runs update-telos.ts tool
- Creates backup, appends content, logs change
- Confirms: "Updated BOOKS.md with automatic backup"
```

### Manual (Direct Tool Usage)

You can also run the tool directly:

```bash
bun ~/.kiro/skills/telos/tools/update-telos.ts BOOKS.md \
  "- *Project Hail Mary* by Andy Weir" \
  "Added favorite book"
```

---

## How It Works

### Skill Routing

The `skill.md` file contains a routing table:

```markdown
| Trigger Phrases | Workflow | File |
|----------------|----------|------|
| "add to TELOS", "update my goals" | Update | workflows/update.md |
```

When Kiro sees these phrases, it:
1. Loads `skill.md`
2. Finds matching trigger
3. Executes the workflow file

### Update Workflow

The `workflows/update.md` file provides step-by-step instructions:
1. Identify target file (BOOKS.md, GOALS.md, etc.)
2. Format the content appropriately
3. Create change description
4. Execute the tool
5. Verify success
6. Confirm to user

### Update Tool

The `tools/update-telos.ts` tool does three things:
1. **Creates timestamped backup** - `backups/BOOKS-20260205-205400.md`
2. **Appends content** - Adds new content to file
3. **Logs change** - Records in `updates.md` with timestamp

---

## What Gets Updated

All TELOS files at `~/.kiro/context/telos/`:

- BELIEFS.md - Core beliefs
- BOOKS.md - Reading list
- CHALLENGES.md - Current obstacles
- FRAMES.md - Conceptual perspectives
- GOALS.md - Life goals
- LESSONS.md - Lessons learned
- MISSION.md - Personal mission
- MODELS.md - Mental models
- MOVIES.md - Film recommendations
- NARRATIVES.md - Key stories
- PREDICTIONS.md - Future predictions
- PROBLEMS.md - Problems to solve
- PROJECTS.md - Active projects
- STRATEGIES.md - Approaches to goals
- TELOS.md - Framework overview
- TRAUMAS.md - Past traumas (optional)
- WISDOM.md - Accumulated wisdom
- WRONG.md - Things you were wrong about

---

## Safety Features

✅ **Automatic backups** - Every change creates timestamped backup  
✅ **Change logging** - All modifications recorded in updates.md  
✅ **Version history** - Backups never overwritten  
✅ **Validation** - Tool checks file exists and filename is valid  

---

## Examples

### Add a Book
```bash
bun ~/.kiro/skills/telos/tools/update-telos.ts BOOKS.md \
  "- *The Pragmatic Programmer* by Hunt & Thomas" \
  "Added classic programming book"
```

### Update Goals
```bash
bun ~/.kiro/skills/telos/tools/update-telos.ts GOALS.md \
  "- Launch SaaS product by Q2 2026" \
  "Added Q2 2026 goal"
```

### Record Lesson
```bash
bun ~/.kiro/skills/telos/tools/update-telos.ts LESSONS.md \
  "### 2026-02-05
- TypeScript + Bun provides better tooling than bash for complex scripts" \
  "Recorded lesson about TypeScript tooling"
```

---

## Troubleshooting

### "bun: command not found"
Install Bun: `curl -fsSL https://bun.sh/install | bash`

### "File does not exist"
Make sure TELOS is installed: `ls ~/.kiro/context/telos/`

### "Invalid file"
Check spelling - must be exact: `BOOKS.md` not `books.md` or `BOOK.md`

---

## Differences from PAI

| Feature | PAI TELOS | Kiro TELOS |
|---------|-----------|------------|
| Auto-loading | Yes (hooks) | No (manual) |
| Skill routing | Automatic | Manual (v0.1) |
| Tool runtime | Bun | Bun (same) |
| Backup system | Automatic | Automatic (same) |
| Change logging | Automatic | Automatic (same) |

---

## Next Steps

1. Install Bun runtime
2. Copy skills to ~/.kiro/skills/
3. Test the tool manually
4. Use with Kiro via trigger phrases
5. View your backups and change log

---

## Future Enhancements (v0.2+)

- Automatic skill loading at session start
- Context relevance detection
- Search across TELOS files
- TELOS dashboard (web UI)
- Export/import functionality
