import { ChromaClient, Collection } from 'chromadb';
import type { MemoryEntry, QueryParams, QueryResult } from './types';

export interface ChromaConfig {
  path: string;              // ChromaDB data directory path
  collectionName: string;    // Collection name
}

export class MemoryChromaClient {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private config: ChromaConfig;
  
  constructor(config: ChromaConfig) {
    this.config = config;
    // ChromaDB TypeScript client connects to HTTP server
    // Path should be HTTP URL (e.g., http://localhost:8000)
    this.client = new ChromaClient({
      path: config.path
    });
  }
  
  async initialize(): Promise<void> {
    try {
      // Try to get existing collection
      this.collection = await this.client.getCollection({
        name: this.config.collectionName
      });
    } catch {
      // Create collection if it doesn't exist
      this.collection = await this.client.createCollection({
        name: this.config.collectionName,
        metadata: { description: "Kiro work session memory" }
      });
    }
  }
  
  async addEntry(entry: MemoryEntry): Promise<void> {
    if (!this.collection) {
      throw new Error("Collection not initialized. Call initialize() first.");
    }
    
    await this.collection.add({
      ids: [entry.session_id],
      documents: [entry.document],
      metadatas: [entry.metadata as Record<string, any>]
    });
  }
  
  async query(params: QueryParams): Promise<QueryResult[]> {
    if (!this.collection) {
      throw new Error("Collection not initialized. Call initialize() first.");
    }
    
    const results = await this.collection.query({
      queryTexts: [params.query],
      nResults: params.limit || 5,
      where: params.where as Record<string, any> | undefined
    });
    
    return this.formatResults(results);
  }
  
  async updateMetadata(sessionId: string, metadata: Partial<Record<string, any>>): Promise<void> {
    if (!this.collection) {
      throw new Error("Collection not initialized. Call initialize() first.");
    }
    
    await this.collection.update({
      ids: [sessionId],
      metadatas: [metadata]
    });
  }
  
  async count(): Promise<number> {
    if (!this.collection) {
      throw new Error("Collection not initialized. Call initialize() first.");
    }
    
    return await this.collection.count();
  }
  
  private formatResults(results: any): QueryResult[] {
    const formatted: QueryResult[] = [];
    
    if (!results.ids || !results.ids[0]) {
      return formatted;
    }
    
    const ids = results.ids[0];
    const metadatas = results.metadatas?.[0] || [];
    const distances = results.distances?.[0] || [];
    
    for (let i = 0; i < ids.length; i++) {
      const metadata = metadatas[i] || {};
      formatted.push({
        session_id: ids[i],
        task: metadata.task || '',
        outcome: metadata.outcome || '',
        files: metadata.files || [],
        timestamp: metadata.timestamp || '',
        similarity: 1 - (distances[i] || 0), // Convert distance to similarity
        rating: metadata.rating,
        sentiment: metadata.sentiment
      });
    }
    
    return formatted;
  }
}
