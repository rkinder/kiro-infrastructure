# v0.3 Memory System Requirements

## Overview

The v0.3 Memory System brings **modern vector database capabilities** to Kiro CLI using **Vectra** (embedded vector DB) + **AWS Bedrock** (embeddings). This system processes work journals into semantic memory, enabling intelligent context retrieval, automatic pattern recognition, and continuous learning through vector similarity search.

**Key Innovation:** Instead of manual tier management and pattern extraction, we leverage Bedrock's embeddings and Vectra's local vector search to automatically understand semantic relationships between work sessions - all running embedded with no external servers.

## Problem Statement

Kiro CLI currently lacks persistent learning mechanisms. While v0.2's WorkCapture hook captures work sessions to journals, there is no system to:
- Semantically index and search historical work
- Automatically find similar past work using vector similarity
- Provide intelligent context for THEALGORITHM skill
- Learn from patterns without manual extraction

## User Stories

### US-1: Semantic Journal Indexing
**As a** Kiro CLI user  
**I want** my work journals automatically indexed into Vectra  
**So that** the system can semantically search my work history

**Acceptance Criteria:**
- Journal entries from ~/.kiro/journals/ are processed into Vectra index
- Each entry stored as vector (from Bedrock) with metadata
- Metadata includes: timestamp, task, outcome, files, rating, sentiment
- Original journals remain unchanged (read-only processing)
- No external servers required (fully embedded)

### US-2: Semantic Work Search
**As a** Kiro CLI user  
**I want** to find similar past work using natural language queries  
**So that** I can learn from previous successes and avoid past failures

**Acceptance Criteria:**
- Query like "implementing TypeScript hooks" returns similar past work
- Results ranked by semantic similarity (cosine distance)
- Can filter by outcome (success/failure), date range, files
- Returns top N most relevant entries with context

### US-3: Pattern Recognition via Similarity
**As a** Kiro CLI user  
**I want** the system to automatically identify patterns in my work  
**So that** it can provide better assistance without manual configuration

**Acceptance Criteria:**
- System identifies frequently occurring task types via clustering
- Recognizes successful approaches for specific problem domains
- Detects anti-patterns from failed attempts
- Patterns available for THEALGORITHM skill integration

### US-4: Learning Integration
**As a** Kiro CLI user  
**I want** the memory system to support THEALGORITHM skill  
**So that** the AI can provide context-aware assistance based on my history

**Acceptance Criteria:**
- THEALGORITHM can query memory for relevant past work
- Memory provides context for decision-making
- System learns user preferences from rating patterns
- Sentiment analysis enhances understanding of outcomes

## Functional Requirements

### FR-1: Journal Processing Engine
**WHEN** a new journal entry is detected  
**THE system SHALL** parse the entry and extract structured data  
**WHERE** structured data includes task, outcome, files_modified, timestamp

**Acceptance Criteria:**
- Parses markdown journal format from WorkCapture
- Extracts all metadata fields
- Handles malformed entries gracefully
- Processing completes within 100ms per entry

### FR-2: ChromaDB Integration
**WHEN** structured data is extracted from journals  
**THE system SHALL** store it in ChromaDB with automatic embeddings  
**WHERE** each entry becomes a document with metadata

**Acceptance Criteria:**
- ChromaDB client initialized on first use
- Collection "work_memory" created if not exists
- Documents stored with unique IDs (session_id)
- Embeddings generated automatically by ChromaDB
- Metadata stored for filtering (timestamp, outcome, rating, etc.)

### FR-3: Semantic Search API
**WHEN** a semantic query is submitted  
**THE system SHALL** return relevant past work ranked by similarity  
**WHERE** similarity is computed using vector embeddings

**Acceptance Criteria:**
- Query accepts natural language text
- Returns top N results (configurable, default 5)
- Results include similarity scores
- Supports metadata filtering (date, outcome, files)
- Query completes within 200ms

### FR-4: Rating Capture
**WHEN** a user provides explicit feedback (1-5 stars)  
**THE system SHALL** update the corresponding memory entry  
**WHERE** rating is stored as metadata

**Acceptance Criteria:**
- Rating command accepts session_id and rating (1-5)
- Updates ChromaDB metadata for that entry
- Rating persists across sessions
- Can query by rating threshold

### FR-5: Sentiment Analysis
**WHEN** processing journal outcomes  
**THE system SHALL** analyze sentiment (positive/negative/neutral)  
**WHERE** sentiment is stored as metadata

**Acceptance Criteria:**
- Analyzes outcome text for sentiment
- Classifies as positive/negative/neutral
- Stores sentiment score (-1 to 1)
- Sentiment available for filtering

### FR-6: Pattern Discovery
**WHEN** querying for patterns  
**THE system SHALL** use ChromaDB similarity to identify clusters  
**WHERE** clusters represent common task types or approaches

**Acceptance Criteria:**
- Identifies task clusters via embedding similarity
- Returns representative examples from each cluster
- Provides cluster statistics (size, success rate)
- Updates as new entries are added

### FR-7: THEALGORITHM Integration
**WHEN** THEALGORITHM skill requests context  
**THE system SHALL** provide relevant memory entries  
**WHERE** relevance is determined by semantic similarity to current task

**Acceptance Criteria:**
- THEALGORITHM can query memory with task description
- Returns relevant past work with outcomes
- Includes success/failure patterns
- Provides confidence scores

### FR-8: Memory Maintenance
**WHEN** memory grows large  
**THE system SHALL** maintain performance through ChromaDB optimization  
**WHERE** optimization includes indexing and compression

**Acceptance Criteria:**
- Handles 10,000+ entries without degradation
- Query performance remains <200ms
- Storage grows linearly with entries
- Supports manual compaction if needed

## Non-Functional Requirements

### NFR-1: Performance
- Journal processing: <100ms per entry
- Semantic search: <200ms per query
- ChromaDB initialization: <1s
- Memory footprint: <100MB for client

### NFR-2: Reliability
- Graceful handling of ChromaDB unavailability
- Automatic reconnection on connection loss
- No data loss during processing failures
- Idempotent journal processing (can reprocess safely)

### NFR-3: Security
- ChromaDB runs locally (no external data transmission)
- Journal files remain read-only
- No sensitive data in embeddings
- Metadata sanitized before storage

### NFR-4: Scalability
- Supports 10,000+ memory entries
- Linear storage growth
- Constant-time semantic search (via HNSW index)
- Handles concurrent queries

### NFR-5: Maintainability
- Clear separation: JournalProcessor → ChromaDB → Query API
- TypeScript with full type safety
- Comprehensive error handling
- Logging for debugging

## Technical Constraints

### TC-1: Runtime Environment
- TypeScript + Bun runtime (consistent with v0.2 hooks)
- ChromaDB TypeScript client (chromadb npm package)
- ChromaDB embedded mode (no server required - works like SQLite)

### TC-2: Data Format
- Input: Markdown journals from WorkCapture (unchanged)
- Storage: ChromaDB embedded database at ~/.kiro/memory/chromadb/
- Output: JSON query results

### TC-3: Integration Points
- WorkCapture hook (v0.2) - unchanged, continues writing journals
- TELOS context system - memory queries enhance context
- THEALGORITHM skill - primary consumer of memory API

### TC-4: Dependencies
- chromadb (npm) - TypeScript client with embedded mode
- No server installation required
- No Python dependencies required
- Database stored as files in ~/.kiro/memory/chromadb/

## Success Criteria

### Functional Success
- ✅ All journal entries indexed in ChromaDB
- ✅ Semantic search returns relevant results
- ✅ Patterns automatically identified
- ✅ THEALGORITHM can query memory
- ✅ Rating and sentiment captured

### Performance Success
- ✅ <100ms journal processing
- ✅ <200ms semantic queries
- ✅ Handles 10,000+ entries
- ✅ <100MB memory footprint

### Quality Success
- ✅ Zero data loss during processing
- ✅ Graceful ChromaDB failure handling
- ✅ Type-safe TypeScript implementation
- ✅ Comprehensive test coverage

## Comparison to Traditional Approach

| Aspect | Traditional (File-based) | ChromaDB (Vector-based) |
|--------|-------------------------|-------------------------|
| **Storage** | HOT/WARM/COLD tiers | Single collection with metadata |
| **Search** | Manual pattern matching | Semantic vector similarity |
| **Patterns** | Custom extraction algorithms | Automatic clustering |
| **Scalability** | Degrades with size | Constant-time search |
| **Complexity** | ~156 hours implementation | ~40 hours implementation |
| **Maintenance** | Manual tier management | Automatic optimization |

**Why ChromaDB Wins:**
- 75% less implementation time
- Better search quality (semantic vs keyword)
- Automatic pattern recognition
- Production-ready scalability
- Modern, maintainable architecture
