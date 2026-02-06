import { describe, test, expect } from 'bun:test';
import { analyzeSentiment } from '../lib/sentiment';

describe('Sentiment Analyzer', () => {
  test('identifies positive sentiment', () => {
    const result = analyzeSentiment('Successfully completed the task');
    expect(result.label).toBe('positive');
    expect(result.score).toBeGreaterThan(0);
  });
  
  test('identifies negative sentiment', () => {
    const result = analyzeSentiment('Failed with multiple errors');
    expect(result.label).toBe('negative');
    expect(result.score).toBeLessThan(0);
  });
  
  test('identifies neutral sentiment', () => {
    const result = analyzeSentiment('Updated the configuration');
    expect(result.label).toBe('neutral');
    expect(Math.abs(result.score)).toBeLessThanOrEqual(0.2);
  });
  
  test('score is bounded between -1 and 1', () => {
    const result = analyzeSentiment('error error error error error error');
    expect(result.score).toBeGreaterThanOrEqual(-1);
    expect(result.score).toBeLessThanOrEqual(1);
  });
  
  test('same text produces same result', () => {
    const text = 'Successfully implemented the feature';
    const result1 = analyzeSentiment(text);
    const result2 = analyzeSentiment(text);
    expect(result1.label).toBe(result2.label);
    expect(result1.score).toBe(result2.score);
  });
});
