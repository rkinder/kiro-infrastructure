import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { TelosContext } from './types';

export class TelosContextLoader {
  constructor(private telosPath: string) {}
  
  async load(): Promise<TelosContext> {
    const context: TelosContext = {};
    
    if (!existsSync(this.telosPath)) {
      return context; // Graceful: return empty context
    }
    
    try {
      const files = readdirSync(this.telosPath).filter(f => f.endsWith('.md'));
      
      for (const file of files) {
        const filePath = join(this.telosPath, file);
        const content = readFileSync(filePath, 'utf-8');
        const key = file.replace('.md', '').toLowerCase();
        
        // Parse based on file type
        if (key === 'mission') {
          context.mission = this.extractText(content);
        } else if (key === 'beliefs') {
          context.beliefs = this.extractList(content);
        } else if (key === 'goals') {
          context.goals = this.extractList(content);
        } else {
          // Store other files as preferences
          if (!context.preferences) {
            context.preferences = {};
          }
          context.preferences[key] = this.extractText(content);
        }
      }
    } catch (error) {
      console.warn('TELOS context loading failed:', error);
      // Graceful: return partial context
    }
    
    return context;
  }
  
  private extractText(content: string): string {
    // Remove markdown headers and extract text
    return content
      .split('\n')
      .filter(line => !line.startsWith('#'))
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ');
  }
  
  private extractList(content: string): string[] {
    // Extract bullet points or numbered lists
    const items: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match bullet points (-, *, +) or numbered lists (1., 2., etc.)
      const match = trimmed.match(/^[-*+]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
      
      if (match) {
        items.push(match[1]);
      }
    }
    
    return items;
  }
}
