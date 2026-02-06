#!/usr/bin/env bun
/**
 * update-telos - Update TELOS life context with automatic backups and change tracking
 *
 * This command manages updates to the TELOS life context files, ensuring:
 * - Automatic timestamped backups before any modification
 * - Change tracking in updates.md
 * - Complete version history
 *
 * Usage:
 *   bun update-telos.ts <file> "<content>" "<change-description>"
 *
 * Example:
 *   bun update-telos.ts BOOKS.md "- Project Hail Mary by Andy Weir" "Added new favorite book"
 *
 * Files that can be updated:
 * - BELIEFS.md - Core beliefs and world model
 * - BOOKS.md - Favorite books
 * - CHALLENGES.md - Current challenges
 * - FRAMES.md - Mental frames and perspectives
 * - GOALS.md - Life goals
 * - LESSONS.md - Lessons learned
 * - MISSION.md - Life mission
 * - MODELS.md - Mental models
 * - MOVIES.md - Favorite movies
 * - NARRATIVES.md - Personal narratives
 * - PREDICTIONS.md - Predictions about the future
 * - PROBLEMS.md - Problems to solve
 * - PROJECTS.md - Active projects
 * - STRATEGIES.md - Strategies being employed
 * - TELOS.md - Main TELOS document
 * - TRAUMAS.md - Past traumas
 * - WISDOM.md - Accumulated wisdom
 * - WRONG.md - Things I was wrong about
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const TELOS_DIR = join(process.env.HOME!, '.kiro', 'context', 'telos');
const BACKUPS_DIR = join(TELOS_DIR, 'backups');
const UPDATES_FILE = join(TELOS_DIR, 'updates.md');

// Valid TELOS files
const VALID_FILES = [
  'BELIEFS.md', 'BOOKS.md', 'CHALLENGES.md', 'FRAMES.md', 'GOALS.md',
  'LESSONS.md', 'MISSION.md', 'MODELS.md', 'MOVIES.md', 'NARRATIVES.md',
  'PREDICTIONS.md', 'PROBLEMS.md', 'PROJECTS.md', 'STRATEGIES.md',
  'TELOS.md', 'TRAUMAS.md', 'WISDOM.md', 'WRONG.md'
];

function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function getDateForLog(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('❌ Usage: bun update-telos.ts <file> "<content>" "<change-description>"');
    console.error('\nExample: bun update-telos.ts BOOKS.md "- New Book Title" "Added favorite book"');
    console.error('\nValid files:', VALID_FILES.join(', '));
    process.exit(1);
  }

  const [filename, content, changeDescription] = args;

  // Validate filename
  if (!VALID_FILES.includes(filename)) {
    console.error(`❌ Invalid file: ${filename}`);
    console.error(`Valid files: ${VALID_FILES.join(', ')}`);
    process.exit(1);
  }

  const targetFile = join(TELOS_DIR, filename);

  // Check if file exists
  if (!existsSync(targetFile)) {
    console.error(`❌ File does not exist: ${targetFile}`);
    console.error(`   Make sure TELOS is installed at: ${TELOS_DIR}`);
    process.exit(1);
  }

  // Ensure backups directory exists
  if (!existsSync(BACKUPS_DIR)) {
    mkdirSync(BACKUPS_DIR, { recursive: true });
    console.log(`📁 Created backups directory: ${BACKUPS_DIR}`);
  }

  // Step 1: Create timestamped backup
  const timestamp = getTimestamp();
  const backupFilename = filename.replace('.md', `-${timestamp}.md`);
  const backupPath = join(BACKUPS_DIR, backupFilename);

  try {
    copyFileSync(targetFile, backupPath);
    console.log(`✅ Backup created: ${backupFilename}`);
  } catch (error) {
    console.error(`❌ Failed to create backup: ${error}`);
    process.exit(1);
  }

  // Step 2: Update the target file (append content)
  try {
    const currentContent = readFileSync(targetFile, 'utf-8');
    const updatedContent = currentContent.trimEnd() + '\n' + content + '\n';
    writeFileSync(targetFile, updatedContent, 'utf-8');
    console.log(`✅ Updated: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to update file: ${error}`);
    process.exit(1);
  }

  // Step 3: Update updates.md with change log
  try {
    const logTimestamp = getDateForLog();
    const logEntry = `
## ${logTimestamp}

- **File Modified**: ${filename}
- **Change Type**: Content Addition
- **Description**: ${changeDescription}
- **Backup Location**: \`backups/${backupFilename}\`

`;

    let updatesContent = '';
    if (existsSync(UPDATES_FILE)) {
      updatesContent = readFileSync(UPDATES_FILE, 'utf-8');
    } else {
      // Create initial updates.md if it doesn't exist
      updatesContent = '# Updates Log\n\nAutomatic log of all TELOS updates with timestamps.\n\n---\n\n';
    }

    // Append the new entry
    const updatedUpdates = updatesContent.trimEnd() + '\n' + logEntry;
    writeFileSync(UPDATES_FILE, updatedUpdates, 'utf-8');
    console.log(`✅ Change logged in updates.md`);
  } catch (error) {
    console.error(`❌ Failed to update updates.md: ${error}`);
    process.exit(1);
  }

  console.log('\n🎯 TELOS update complete!');
  console.log(`   File: ${filename}`);
  console.log(`   Backup: backups/${backupFilename}`);
  console.log(`   Change: ${changeDescription}`);
}

main();
