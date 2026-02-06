import { LocalIndex } from 'vectra';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import type { MemoryEntry, QueryParams, QueryResult } from './types';

export interface VectraConfig {
  indexPath: string;
  region: string;
  embeddingModel?: string;  // Default: amazon.titan-embed-text-v2:0
}

export class MemoryVectraClient {
  private index: LocalIndex;
  private bedrock: BedrockRuntimeClient;
  private embeddingModel: string;
  
  constructor(private config: VectraConfig) {
    this.index = new LocalIndex(config.indexPath);
    this.bedrock = new BedrockRuntimeClient({ region: config.region });
    this.embeddingModel = config.embeddingModel || 'amazon.titan-embed-text-v2:0';
  }
  
  async initialize(): Promise<void> {
    const exists = await this.index.isIndexCreated();
    
    if (!exists) {
      await this.index.createIndex({
        version: 1,
        metadata_config: {
          indexed: ['outcome', 'timestamp', 'rating', 'sentiment']
        }
      });
    }
  }
  
  private async getEmbedding(text: string): Promise<number[]> {
    const response = await this.bedrock.send(new InvokeModelCommand({
      modelId: this.embeddingModel,
      body: JSON.stringify({ inputText: text })
    }));
    
    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.embedding;
  }
  
  async addEntry(entry: MemoryEntry): Promise<void> {
    const vector = await this.getEmbedding(entry.document);
    
    await this.index.insertItem({
      vector,
      metadata: {
        session_id: entry.session_id,
        ...entry.metadata
      }
    });
  }
  
  async query(params: QueryParams): Promise<QueryResult[]> {
    const vector = await this.getEmbedding(params.query);
    
    const results = await this.index.queryItems(
      vector,
      params.limit || 5,
      params.where as any
    );
    
    return results.map(r => ({
      session_id: r.item.metadata.session_id as string,
      task: r.item.metadata.task as string,
      outcome: r.item.metadata.outcome as string,
      files: (r.item.metadata.files as string[]) || [],
      timestamp: r.item.metadata.timestamp as string,
      similarity: r.score,
      rating: r.item.metadata.rating as number | undefined,
      sentiment: r.item.metadata.sentiment as string | undefined
    }));
  }
  
  async count(): Promise<number> {
    const items = await this.index.listItems();
    return items.length;
  }
}
