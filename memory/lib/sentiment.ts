import type { SentimentResult } from './types';

class SentimentAnalyzer {
  private positiveWords = [
    'success', 'completed', 'working', 'fixed', 'resolved', 
    'implemented', 'achieved', 'excellent', 'great', 'perfect'
  ];
  
  private negativeWords = [
    'failed', 'error', 'broken', 'issue', 'problem', 
    'blocked', 'bug', 'crash', 'incorrect', 'wrong'
  ];
  
  async analyze(text: string): Promise<SentimentResult> {
    const lowerText = text.toLowerCase();
    
    let score = 0;
    
    // Count positive words
    for (const word of this.positiveWords) {
      if (lowerText.includes(word)) {
        score += 0.2;
      }
    }
    
    // Count negative words
    for (const word of this.negativeWords) {
      if (lowerText.includes(word)) {
        score -= 0.2;
      }
    }
    
    // Clamp score between -1 and 1
    score = Math.max(-1, Math.min(1, score));
    
    // Determine label
    let label: 'positive' | 'negative' | 'neutral';
    if (score > 0.2) {
      label = 'positive';
    } else if (score < -0.2) {
      label = 'negative';
    } else {
      label = 'neutral';
    }
    
    return { label, score };
  }
}

// Export convenience function
export function analyzeSentiment(text: string): SentimentResult {
  const analyzer = new SentimentAnalyzer();
  const lowerText = text.toLowerCase();
  
  let score = 0;
  const positiveWords = [
    'success', 'completed', 'working', 'fixed', 'resolved', 
    'implemented', 'achieved', 'excellent', 'great', 'perfect'
  ];
  const negativeWords = [
    'failed', 'error', 'broken', 'issue', 'problem', 
    'blocked', 'bug', 'crash', 'incorrect', 'wrong'
  ];
  
  for (const word of positiveWords) {
    if (lowerText.includes(word)) score += 0.2;
  }
  
  for (const word of negativeWords) {
    if (lowerText.includes(word)) score -= 0.2;
  }
  
  score = Math.max(-1, Math.min(1, score));
  
  let label: 'positive' | 'negative' | 'neutral';
  if (score > 0.2) label = 'positive';
  else if (score < -0.2) label = 'negative';
  else label = 'neutral';
  
  return { label, score };
}
