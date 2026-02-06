import type { ResponseFormat } from './types';

export class ResponseFormatter {
  private voiceWordLimit: number;
  
  constructor(voiceWordLimit: number = 150) {
    this.voiceWordLimit = voiceWordLimit;
  }
  
  format(response: Partial<ResponseFormat>): string {
    const sections: string[] = [];
    
    // Required: SUMMARY
    if (response.summary) {
      sections.push(`**SUMMARY**\n${response.summary}`);
    }
    
    // Optional: ANALYSIS
    if (response.analysis) {
      sections.push(`**ANALYSIS**\n${response.analysis}`);
    }
    
    // Optional: ACTIONS
    if (response.actions && response.actions.length > 0) {
      sections.push(`**ACTIONS**\n${response.actions.map(a => `- ${a}`).join('\n')}`);
    }
    
    // Optional: RESULTS
    if (response.results) {
      sections.push(`**RESULTS**\n${response.results}`);
    }
    
    // Required: STATUS
    if (response.status) {
      sections.push(`**STATUS**\n${response.status}`);
    }
    
    // Optional: CAPTURE
    if (response.capture) {
      sections.push(`**CAPTURE**\n${response.capture}`);
    }
    
    // Optional: NEXT
    if (response.next) {
      sections.push(`**NEXT**\n${response.next}`);
    }
    
    // Optional: STORY_EXPLANATION (numbered list)
    if (response.story_explanation && response.story_explanation.length > 0) {
      const numbered = response.story_explanation.map((item, i) => `${i + 1}. ${item}`).join('\n');
      sections.push(`**STORY_EXPLANATION**\n${numbered}`);
    }
    
    // Optional: RATE
    if (response.rate !== undefined) {
      sections.push(`**RATE**\n${'⭐'.repeat(response.rate)} (${response.rate}/5)`);
    }
    
    // Optional: VOICE_OUTPUT (word-limited)
    if (response.voice_output) {
      const limited = this.limitWords(response.voice_output, this.voiceWordLimit);
      sections.push(`**VOICE_OUTPUT**\n${limited}`);
    }
    
    return sections.join('\n\n');
  }
  
  validate(response: Partial<ResponseFormat>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!response.summary) {
      errors.push('Missing required field: summary');
    }
    
    if (!response.status) {
      errors.push('Missing required field: status');
    }
    
    // Validate story_explanation format
    if (response.story_explanation) {
      if (!Array.isArray(response.story_explanation)) {
        errors.push('story_explanation must be an array');
      }
    }
    
    // Validate rate range
    if (response.rate !== undefined) {
      if (response.rate < 1 || response.rate > 5) {
        errors.push('rate must be between 1 and 5');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  private limitWords(text: string, limit: number): string {
    const words = text.split(/\s+/);
    if (words.length <= limit) {
      return text;
    }
    return words.slice(0, limit).join(' ') + '...';
  }
}
