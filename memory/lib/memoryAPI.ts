import { MemoryVectraClient } from './vectraClient';
import type { QueryParams, QueryResult } from './types';
import { join } from 'path';

export interface MemoryAPIConfig {
  indexPath?: string;
  region?: string;
}

export class MemoryAPI {
  private client: MemoryVectraClient;
  
  constructor(config?: MemoryAPIConfig) {
    const HOME = process.env.HOME || '';
    const indexPath = config?.indexPath || join(HOME, '.kiro/memory/vectra');
    const region = config?.region || process.env.AWS_REGION || 'us-east-2';
    
    this.client = new MemoryVectraClient({ indexPath, region });
  }
  
  async query(query: string, limit?: number): Promise<QueryResult[]> {
    return this.client.query({ query, limit });
  }
  
  async queryByOutcome(outcome: string, limit?: number): Promise<QueryResult[]> {
    return this.client.query({
      query: outcome,
      limit,
      where: { outcome: { $contains: outcome } }
    });
  }
  
  async queryByFiles(filename: string, limit?: number): Promise<QueryResult[]> {
    return this.client.query({
      query: filename,
      limit,
      where: { files: { $contains: filename } }
    });
  }
  
  async querySimilarWork(task: string, limit?: number): Promise<QueryResult[]> {
    return this.client.query({ query: task, limit });
  }
  
  async getPositiveExamples(limit: number = 10): Promise<QueryResult[]> {
    return this.client.query({
      query: 'successful completed working',
      limit,
      where: { sentiment: 'positive' }
    });
  }
  
  async getNegativeExamples(limit: number = 10): Promise<QueryResult[]> {
    return this.client.query({
      query: 'failed error problem',
      limit,
      where: { sentiment: 'negative' }
    });
  }
  
  async getStats(): Promise<{
    total: number;
    // Add more stats as needed
  }> {
    const total = await this.client.count();
    return { total };
  }
}
