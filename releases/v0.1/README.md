# Kiro v0.1 - TELOS Context System

**Release Date:** 2026-02-05  
**Status:** Initial Release  
**Component:** TELOS (Telic Evolution and Life Operating System)

---

## What's Included

This release provides the foundational TELOS context system for Kiro CLI - a structured way to maintain persistent user context across sessions.

### Directory Structure

```
v0.1/
├── context/
│   └── telos/                # TELOS data files (18 files)
│       ├── TELOS.md
│       ├── BELIEFS.md
│       ├── BOOKS.md
│       └── ... (see full list below)
└── skills/
    └── telos/                # TELOS skill system
        ├── skill.md          # Routing table
        ├── README.md         # Skills documentation
        ├── workflows/
        │   └── update.md     # Update workflow
        └── tools/
            └── update-telos.ts  # Update tool (TypeScript/Bun)
```

**TELOS Files (18 total):**
- TELOS.md, BELIEFS.md, BOOKS.md, CHALLENGES.md, FRAMES.md, GOALS.md, LESSONS.md, MISSION.md, MODELS.md, MOVIES.md, NARRATIVES.md, PREDICTIONS.md, PROBLEMS.md, PROJECTS.md, STRATEGIES.md, TRAUMAS.md, WISDOM.md, WRONG.md, updates.md

---

## Installation

### Prerequisites

**Install Bun runtime** (required for TELOS tools):
```bash
curl -fsSL https://bun.sh/install | bash
```

Restart your terminal after installation.

### Option 1: Copy to ~/.kiro/

```bash
# Create Kiro directories
mkdir -p ~/.kiro/context ~/.kiro/skills

# Copy TELOS context files
cp -r context/telos ~/.kiro/context/

# Copy TELOS skill system
cp -r skills/telos ~/.kiro/skills/

# Make tool executable
chmod +x ~/.kiro/skills/telos/tools/update-telos.ts

# Verify installation
ls ~/.kiro/context/telos/
ls ~/.kiro/skills/telos/
```

### Option 2: Symlink (for development)

```bash
# Create Kiro directories
mkdir -p ~/.kiro/context ~/.kiro/skills

# Symlink TELOS structures
ln -s "$(pwd)/context/telos" ~/.kiro/context/telos
ln -s "$(pwd)/skills/telos" ~/.kiro/skills/telos

# Make tool executable
chmod +x ~/.kiro/skills/telos/tools/update-telos.ts

# Verify installation
ls -la ~/.kiro/context/telos
ls -la ~/.kiro/skills/telos
```
cp -r context/telos ~/.kiro/context/

# Verify installation
ls ~/.kiro/context/telos/
```

### Option 2: Symlink (for development)

```bash
# Create Kiro context directory
mkdir -p ~/.kiro/context

# Symlink TELOS structure
ln -s "$(pwd)/context/telos" ~/.kiro/context/telos

# Verify installation
ls -la ~/.kiro/context/telos
```

---

## Usage

### 1. Personalize Your TELOS Files

Edit the files in `~/.kiro/context/telos/` to reflect your actual:
- Goals and aspirations
- Beliefs and principles
- Active projects
- Lessons learned
- Accumulated wisdom

**Start with these core files:**
- `GOALS.md` - What you're working toward
- `PROJECTS.md` - What you're currently building
- `BELIEFS.md` - What guides your decisions
- `LESSONS.md` - What you've learned

### 2. Use with Kiro (Manual in v0.1)

**Reading TELOS context:**
```bash
kiro-cli chat
> "Read my GOALS.md file at ~/.kiro/context/telos/GOALS.md"
> "Based on my goals, what should I focus on?"
```

**Updating TELOS (via tool):**
```bash
# Add a book
bun ~/.kiro/skills/telos/tools/update-telos.ts BOOKS.md \
  "- *Project Hail Mary* by Andy Weir" \
  "Added favorite book"

# Update goals
bun ~/.kiro/skills/telos/tools/update-telos.ts GOALS.md \
  "- Launch SaaS product by Q2 2026" \
  "Added Q2 goal"

# Record lesson
bun ~/.kiro/skills/telos/tools/update-telos.ts LESSONS.md \
  "### 2026-02-05
- TypeScript + Bun provides better tooling than bash" \
  "Recorded TypeScript lesson"
```

**With Kiro assistance:**
```bash
kiro-cli chat
> "Add Project Hail Mary to my TELOS books using the update tool"
```

Kiro will recognize the request and execute the update-telos tool with proper parameters.

### 3. View Backups and Change Log

```bash
# View all backups
ls ~/.kiro/context/telos/backups/

# View specific backup
cat ~/.kiro/context/telos/backups/BOOKS-20260205-205400.md

# View change log
cat ~/.kiro/context/telos/updates.md
```

---

## File Descriptions

| File | Purpose | Update Frequency |
|------|---------|------------------|
| **BELIEFS.md** | Core beliefs and principles | Rarely (beliefs are stable) |
| **BOOKS.md** | Reading list | As you read |
| **CHALLENGES.md** | Current obstacles | Monthly or as challenges shift |
| **FRAMES.md** | Conceptual perspectives | Occasionally (frames evolve slowly) |
| **GOALS.md** | Life goals and objectives | Monthly or when goals change |
| **LESSONS.md** | Lessons learned | Frequently (capture learnings) |
| **MISSION.md** | Personal mission | Rarely (mission is foundational) |
| **MODELS.md** | Mental models | Occasionally (as you learn new models) |
| **MOVIES.md** | Film recommendations | As you watch |
| **NARRATIVES.md** | Key stories and themes | Quarterly or as narratives develop |
| **PREDICTIONS.md** | Future predictions | Annually or when making predictions |
| **PROBLEMS.md** | Problems you're solving | Monthly or as interests shift |
| **PROJECTS.md** | Active projects and status | Weekly or as projects evolve |
| **STRATEGIES.md** | Approaches to goals | Quarterly or when strategies change |
| **TELOS.md** | Framework overview | Rarely (only structural changes) |
| **TRAUMAS.md** | Past traumas (optional) | Rarely or never |
| **WISDOM.md** | Accumulated wisdom | Occasionally (as wisdom emerges) |
| **WRONG.md** | Things you were wrong about | Occasionally (as you learn) |
| **updates.md** | Change log | Automatically (on each update) |

---

## Design Principles

### 1. Minimal Structure
Files contain light sample content - you fill in what matters to you. Not all files are required.

### 2. Markdown Format
Plain text markdown files are:
- Human-readable
- Version-controllable
- Tool-agnostic
- Future-proof

### 3. Incremental Adoption
Start with 2-3 core files (GOALS, PROJECTS, BELIEFS). Add more as needed.

### 4. No Lock-in
Your data lives in simple markdown files. Use them with any tool, migrate anywhere.

---

## Next Steps

### Immediate (v0.1)
- [x] Create TELOS directory structure
- [x] Add skeleton files with sample content
- [x] Create skill system with routing
- [x] Build update-telos tool (TypeScript/Bun)
- [x] Document workflows and usage
- [ ] Personalize your TELOS files
- [ ] Test tool with Kiro sessions

### Future (v0.2+)
- [ ] Automatic context loading at session start
- [ ] Skill auto-discovery and routing
- [ ] Search across TELOS files
- [ ] Context relevance detection
- [ ] Additional workflows (search, export, dashboard)

---

## Differences from PAI TELOS

This Kiro adaptation differs from PAI's TELOS in several ways:

| Aspect | PAI TELOS | Kiro TELOS |
|--------|-----------|------------|
| **Location** | `~/.claude/skills/CORE/USER/TELOS/` | `~/.kiro/context/telos/` |
| **File Names** | UPPERCASE.md | UPPERCASE.md (same) |
| **Auto-loading** | Via Claude Code hooks | Manual (v0.1), auto later |
| **Updates** | Via Update workflow + CLI tool | Manual (v0.1), tooling later |
| **Backups** | Automatic timestamped backups | Manual (v0.1), auto later |
| **Voice Integration** | Yes (ElevenLabs) | No (CLI-focused) |

---

## Contributing

Found an issue or have a suggestion? This is part of the PAI → Kiro adaptation project.

**Repository:** https://github.com/danielmiessler/PAI  
**Discussion:** Open an issue or PR in the PAI repository

---

## Credits

**Original TELOS System:** Daniel Miessler (PAI Project)  
**Kiro Adaptation:** Community effort to bring PAI concepts to Kiro CLI  
**License:** MIT

---

## Changelog

### v0.1 (2026-02-05)
- Initial release
- 16 TELOS files with skeleton content
- Basic directory structure
- Manual installation and usage
- No automation (coming in v0.2)
