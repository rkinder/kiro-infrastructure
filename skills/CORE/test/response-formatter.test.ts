import { describe, test, expect } from 'bun:test';
import { ResponseFormatter } from '../response-formatter';

describe('ResponseFormatter', () => {
  const formatter = new ResponseFormatter(150);
  
  test('formats complete response with all sections', () => {
    const response = {
      summary: 'Task completed successfully',
      analysis: 'The implementation was straightforward',
      actions: ['Created file', 'Ran tests'],
      results: 'All tests passing',
      status: 'Complete',
      capture: 'Implemented feature X',
      next: 'Deploy to production',
      story_explanation: ['First step', 'Second step', 'Third step'],
      rate: 5,
      voice_output: 'Task completed successfully. All tests are passing.'
    };
    
    const formatted = formatter.format(response);
    
    expect(formatted).toContain('**SUMMARY**');
    expect(formatted).toContain('**ANALYSIS**');
    expect(formatted).toContain('**ACTIONS**');
    expect(formatted).toContain('**RESULTS**');
    expect(formatted).toContain('**STATUS**');
    expect(formatted).toContain('**CAPTURE**');
    expect(formatted).toContain('**NEXT**');
    expect(formatted).toContain('**STORY_EXPLANATION**');
    expect(formatted).toContain('**RATE**');
    expect(formatted).toContain('**VOICE_OUTPUT**');
  });
  
  test('formats minimal response with required fields only', () => {
    const response = {
      summary: 'Task done',
      status: 'Complete'
    };
    
    const formatted = formatter.format(response);
    
    expect(formatted).toContain('**SUMMARY**');
    expect(formatted).toContain('**STATUS**');
    expect(formatted).not.toContain('**ANALYSIS**');
  });
  
  test('story_explanation is formatted as numbered list', () => {
    const response = {
      summary: 'Test',
      status: 'Done',
      story_explanation: ['First', 'Second', 'Third']
    };
    
    const formatted = formatter.format(response);
    
    expect(formatted).toContain('1. First');
    expect(formatted).toContain('2. Second');
    expect(formatted).toContain('3. Third');
  });
  
  test('voice output respects word limit', () => {
    const longText = 'word '.repeat(200); // 200 words
    const response = {
      summary: 'Test',
      status: 'Done',
      voice_output: longText
    };
    
    const formatted = formatter.format(response);
    const voiceSection = formatted.split('**VOICE_OUTPUT**\n')[1];
    const wordCount = voiceSection.trim().split(/\s+/).length;
    
    expect(wordCount).toBeLessThanOrEqual(151); // 150 + ellipsis
  });
  
  test('validates required fields', () => {
    const invalid = { summary: 'Test' }; // Missing status
    const result = formatter.validate(invalid);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required field: status');
  });
  
  test('validates rate range', () => {
    const invalid = { summary: 'Test', status: 'Done', rate: 6 };
    const result = formatter.validate(invalid);
    
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
  
  test('validates story_explanation format', () => {
    const invalid = { 
      summary: 'Test', 
      status: 'Done', 
      story_explanation: 'not an array' as any 
    };
    const result = formatter.validate(invalid);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('story_explanation must be an array');
  });
  
  test('valid response passes validation', () => {
    const valid = {
      summary: 'Test completed',
      status: 'Complete',
      rate: 5
    };
    const result = formatter.validate(valid);
    
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
