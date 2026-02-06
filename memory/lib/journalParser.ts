export interface JournalEntry {
  timestamp: string;
  task: string;
  outcome: string;
  files: string[];
  date: string;
}

export function parseJournal(content: string, date: string): JournalEntry[] {
  const entries: JournalEntry[] = [];
  const sections = content.split(/^## /m).slice(1);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length === 0) continue;
    
    const [timeAndTask] = lines;
    const match = timeAndTask.match(/^(\d{2}:\d{2}:\d{2}) - (.+)$/);
    if (!match) continue;
    
    const [, time, task] = match;
    const timestamp = `${date}T${time}Z`;
    
    let outcome = '';
    const files: string[] = [];
    let inFiles = false;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('**Outcome**:')) {
        outcome = line.replace('**Outcome**:', '').trim();
      } else if (line.startsWith('**Files Modified**:')) {
        inFiles = true;
      } else if (inFiles && line.startsWith('- ')) {
        files.push(line.substring(2));
      } else if (line === '---') {
        break;
      }
    }
    
    if (task && outcome) {
      entries.push({ timestamp, task, outcome, files, date });
    }
  }
  
  return entries;
}
