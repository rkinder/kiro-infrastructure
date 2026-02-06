// Type definitions for Kiro Memory System

export interface MemoryEntry {
  session_id: string;
  document: string;        // Full text for embedding
  metadata: MemoryMetadata;
}

export interface MemoryMetadata {
  timestamp: string;
  task: string;
  outcome: string;
  files: string[];
  rating?: number;
  sentiment?: string;
  sentiment_score?: number;
}

export interface QueryParams {
  query: string;           // Natural language query
  limit?: number;          // Max results (default: 5)
  where?: WhereClause;     // Metadata filters
}

export interface WhereClause {
  outcome?: string;        // "success" | "failure"
  timestamp?: {
    $gte?: string;         // Greater than or equal
    $lte?: string;         // Less than or equal
  };
  rating?: {
    $gte?: number;
  };
  sentiment?: string;      // "positive" | "negative" | "neutral"
}

export interface QueryResult {
  session_id: string;
  task: string;
  outcome: string;
  files: string[];
  timestamp: string;
  similarity: number;      // Cosine similarity score
  rating?: number;
  sentiment?: string;
}

export interface Pattern {
  type: string;
  examples: QueryResult[];
  frequency: number;
  success_rate: number;
}

export interface SentimentResult {
  label: 'positive' | 'negative' | 'neutral';
  score: number;  // -1 to 1
}

export interface JournalEntry {
  timestamp: string;
  task: string;
  outcome: string;
  files_modified?: string[];
}
