# Update TELOS Workflow

**Purpose:** Add or modify content in TELOS files with automatic backups and change tracking.

---

## When to Use

User says:
- "add this to my TELOS"
- "update my goals"
- "add this book to TELOS"
- "record this in my BELIEFS"

---

## Steps

### 1. Identify Target File

Determine which TELOS file to update based on user request:

| User Intent | File |
|-------------|------|
| Goals, objectives, aspirations | GOALS.md |
| Books, reading list | BOOKS.md |
| Movies, films | MOVIES.md |
| Beliefs, principles | BELIEFS.md |
| Lessons learned | LESSONS.md |
| Wisdom, insights | WISDOM.md |
| Projects | PROJECTS.md |
| Challenges, obstacles | CHALLENGES.md |
| Strategies, approaches | STRATEGIES.md |
| Mental models | MODELS.md |
| Problems to solve | PROBLEMS.md |
| Conceptual frames | FRAMES.md |
| Narratives, stories | NARRATIVES.md |
| Predictions | PREDICTIONS.md |
| Mission statement | MISSION.md |
| Past traumas | TRAUMAS.md |
| Things you were wrong about | WRONG.md |

### 2. Format the Content

Format the content appropriately for the file:

**For list-based files (BOOKS, MOVIES, GOALS):**
```markdown
- Item description
```

**For dated entries (LESSONS, PREDICTIONS):**
```markdown
### YYYY-MM-DD
- Entry description
```

**For narrative files (MISSION, BELIEFS):**
```markdown
## Section Title
Content here...
```

### 3. Create Change Description

Write a brief description of what's being added:
- "Added favorite book: Project Hail Mary"
- "Updated Q1 2026 goals"
- "Recorded lesson about TypeScript tooling"

### 4. Execute the Tool

Run the update-telos tool:

```bash
bun ~/.kiro/skills/telos/tools/update-telos.ts <FILE> "<CONTENT>" "<DESCRIPTION>"
```

**Example:**
```bash
bun ~/.kiro/skills/telos/tools/update-telos.ts BOOKS.md \
  "- *Project Hail Mary* by Andy Weir" \
  "Added favorite book: Project Hail Mary"
```

### 5. Verify Success

The tool will output:
```
✅ Backup created: BOOKS-20260205-205400.md
✅ Updated: BOOKS.md
✅ Change logged in updates.md

🎯 TELOS update complete!
   File: BOOKS.md
   Backup: backups/BOOKS-20260205-205400.md
   Change: Added favorite book: Project Hail Mary
```

### 6. Confirm to User

Tell the user:
```
Updated your TELOS! Added to BOOKS.md with automatic backup.
You can view your updated books at ~/.kiro/context/telos/BOOKS.md
```

---

## What the Tool Does

1. **Creates timestamped backup** - Copies current file to `backups/` before modification
2. **Appends content** - Adds new content to the end of the file
3. **Logs change** - Records the modification in `updates.md` with timestamp

---

## Error Handling

**If file doesn't exist:**
```
❌ File does not exist: ~/.kiro/context/telos/BOOKS.md
   Make sure TELOS is installed at: ~/.kiro/context/telos
```
→ User needs to install TELOS first

**If invalid filename:**
```
❌ Invalid file: BOOK.md
Valid files: BELIEFS.md, BOOKS.md, ...
```
→ Check spelling, use correct filename

**If Bun not installed:**
```
bash: bun: command not found
```
→ User needs to install Bun: `curl -fsSL https://bun.sh/install | bash`

---

## Manual Alternative

If the tool fails, you can update manually:

1. **Create backup:**
   ```bash
   cp ~/.kiro/context/telos/BOOKS.md ~/.kiro/context/telos/backups/BOOKS-backup.md
   ```

2. **Append content:**
   ```bash
   echo "- New content" >> ~/.kiro/context/telos/BOOKS.md
   ```

3. **Log change:**
   ```bash
   echo "## $(date)" >> ~/.kiro/context/telos/updates.md
   echo "- Updated BOOKS.md" >> ~/.kiro/context/telos/updates.md
   ```

---

## Notes

- Tool always creates backup before modifying
- All changes are logged in updates.md
- Backups are timestamped and never overwritten
- Content is appended, never replaces existing content
