# Context Engineering: Sessions & Memory

Comprehensive guide to context engineering for stateful, intelligent agents. See SKILL.md for core context engineering principles.

## What is Context Engineering?

Context Engineering is the process of dynamically assembling and managing information within an LLM's context window to enable stateful, intelligent agents. It represents an evolution from traditional Prompt Engineering—while prompt engineering focuses on crafting optimal static instructions, context engineering addresses the entire payload, dynamically constructing a state-aware prompt.

**Core distinction:** Context Engineering = Prompt Engineering + dynamic context assembly

### Context Components

The complete context payload includes:

**Context to guide reasoning:**
- System Instructions: Agent's persona, capabilities, constraints
- Tool Definitions: Schemas for APIs/functions the agent can use
- Few-Shot Examples: Curated examples for in-context learning

**Evidential & Factual Data:**
- Long-Term Memory: Persisted knowledge about user/topic across sessions
- External Knowledge (RAG): Information from databases/documents
- Tool Outputs: Data returned by tool calls
- Sub-Agent Outputs: Results from specialized agents

**Immediate conversational information:**
- Conversation History: Turn-by-turn record of current interaction
- State/Scratchpad: Temporary in-progress information for reasoning
- User's Prompt: The immediate query

### Context Engineering Lifecycle

For each turn of conversation:

1. **Fetch Context** - Retrieve user memories, RAG documents, recent events
2. **Prepare Context** - Dynamically construct full prompt (blocking, "hot-path")
3. **Invoke LLM and Tools** - Iterative calls until final response generated
4. **Upload Context** - Persist new information (background, asynchronous)

## Sessions

A session encapsulates the immediate dialogue history and working memory for a single, continuous conversation. Each session is tied to a specific user and contains:

- **Events** - Building blocks of conversation (user input, agent response, tool call, tool output)
- **State** - Structured "working memory" or scratchpad for temporary data

### Session vs Context

**Session History** = Permanent, unabridged transcript of entire conversation  
**Context** = Carefully crafted information payload sent to LLM for a single turn

An agent might construct context by selecting only relevant excerpts from history or adding special formatting.

### Multi-Agent Session Patterns

**Shared, Unified History**
- All agents read/write to single conversation log
- Best for: Tightly coupled collaborative tasks requiring single source of truth
- Events appended chronologically, sub-agents may filter/label before LLM processing

**Separate, Individual Histories**
- Each agent maintains private conversation history
- Communication through explicit messages (final output, not process)
- Implemented via Agent-as-a-Tool or Agent-to-Agent (A2A) Protocol

### Framework Interoperability

Different agent frameworks use internal data representations that create isolation. For cross-framework collaboration:

- **A2A Protocol** - Enables message exchange but not rich contextual state
- **Memory Layer** - Framework-agnostic data layer (summaries, entities, facts) for universal knowledge sharing

### Session Compaction Strategies

Managing long conversations requires intelligent history trimming to control costs and latency.

**Tradeoffs:**
- Context Window Limits - Exceeding limits causes API failure
- API Costs - More tokens = higher cost per turn
- Latency - More text = slower response
- Quality - Too much noise = worse performance

**Compaction Strategies:**

| Strategy | Description | Use Case |
|----------|-------------|----------|
| **Keep last N turns** | Sliding window of most recent turns | Simple, good-enough approach |
| **Token-based truncation** | Include messages until token limit reached | Precise token control |
| **Recursive summarization** | Replace old messages with AI-generated summary | Preserves key facts, reduces cost |

**Trigger Mechanisms:**
- **Count-based** - Trigger when turn/token count exceeds threshold
- **Time-based** - Trigger after inactivity period (background job)
- **Event-based** - Trigger when task/sub-goal/topic concludes

**Best Practice:** Perform expensive operations (summarization) asynchronously in background and persist results to avoid recomputation.

### Production Session Considerations

**Security and Privacy:**
- Strict isolation - One user can never access another's session (ACLs)
- PII redaction before storage - Reduces breach risk, simplifies GDPR/CCPA compliance

**Data Integrity:**
- TTL policy - Auto-delete inactive sessions to manage storage
- Deterministic ordering - Guarantee operations appended in correct chronological sequence

**Performance:**
- Session data is on "hot path" - Must be extremely fast
- Filter/compact before sending to agent - Reduce data transfer size
- Use managed session stores for enterprise-grade requirements

## Memory

Memory provides long-term persistence, capturing and consolidating key information across multiple sessions. Memory and sessions have a symbiotic relationship: sessions generate memories, and memories help manage session size.

### Memory vs RAG

| Aspect | RAG Engines | Memory Managers |
|--------|-------------|-----------------|
| **Primary Goal** | Inject external, factual knowledge | Create personalized, stateful experience |
| **Data Source** | Static, pre-indexed external knowledge | Dialogue between user and agent |
| **Isolation** | Generally shared (global, read-only) | Highly isolated (per-user) |
| **Information Type** | Static, factual, authoritative | Dynamic, user-specific, uncertain |
| **Write Patterns** | Batch processing (offline) | Event-based (per turn/session) |
| **Read Patterns** | Almost always "as-a-tool" | "As-a-tool" OR static retrieval |
| **Data Format** | Natural language "chunk" | Natural language OR structured profile |
| **Data Preparation** | Chunking and indexing | Extraction and consolidation |

**Analogy:** RAG = research librarian (expert on world facts), Memory = personal assistant (expert on the user)

### Memory Structure

A memory consists of:

**Content** - The extracted information (framework-agnostic)
- **Structured** - Dictionary/JSON (e.g., `{"seat_preference": "Window"}`)
- **Unstructured** - Natural language description (e.g., "User prefers window seat")

**Metadata** - Context about the memory
- Unique identifier
- Owner identifiers
- Labels describing content/data source

### Types of Memory

**By Information Type:**

**Declarative Memory ("knowing what")** - Facts, figures, events
- Semantic - General world knowledge
- Entity - Specific user facts
- Episodic - Specific events/interactions

**Procedural Memory ("knowing how")** - Skills and workflows
- Guides agent actions
- Correct sequences for tool calls
- "How-to" instructions

**By Creation Mechanism:**

**Explicit Memory** - User directly commands agent to remember
**Implicit Memory** - Agent infers/extracts from conversation

**By Location:**

**Internal Memory** - Built into agent framework, convenient but limited
**External Memory** - Separate specialized service (Agent Engine Memory Bank, Mem0, Zep)

### Memory Organization Patterns

**Collections** - Multiple self-contained natural language memories per user
- Each memory is distinct event/summary/observation
- Good for: Larger pools of information about specific topics

**Structured User Profile** - Set of core facts like contact card
- Continually updated with new stable information
- Good for: Quick lookups of essential facts (names, preferences, account details)

**Rolling Summary** - Single evolving memory of entire user-agent relationship
- Continuously updated master document
- Good for: Compacting long sessions while preserving vital information

### Memory Storage Architectures

**Vector Databases**
- Enables retrieval based on semantic similarity
- Best for: Unstructured natural language memories ("atomic facts")

**Knowledge Graphs**
- Stores entities and relationships as nodes/edges
- Best for: Structured relational queries ("knowledge triples")

**Hybrid Approach**
- Enrich knowledge graph with vector embeddings
- Enables both relational and semantic searches

### Memory Scope

| Scope | Description | Example |
|-------|-------------|---------|
| **User-Level** | Tied to specific user ID, persists across sessions | "User prefers middle seat" |
| **Session-Level** | Processed insights from single session | "User shopping for NYC-PAR flights Nov 7-14" |
| **Application-Level** | Accessible by all users (shared context) | "Codename XYZ refers to project..." |

### Multimodal Memory

**Memory from Multimodal Source** (most common)
- Processes various data types (text, images, audio)
- Creates textual insight as memory
- Example: Transcribe voice memo → "User expressed frustration about shipping delay"

**Memory with Multimodal Content** (advanced)
- Memory contains non-textual media directly
- Example: Store actual image linked to user request
- Requires specialized models/infrastructure

### Memory Retrieval Patterns

**Timing for Retrieval:**

1. **Memory-as-a-Tool** - Agent decides when to retrieve based on query
2. **Static Retrieval** - Always retrieved at start of each turn

**Inference with Memories:**

**Memories in System Instructions** - Injected as part of agent's base context
**Memories in Conversation History** - Inserted as synthetic messages in dialogue

### Memory Provenance

Tracking memory lineage ensures the agent understands source and reliability of memories.

**During memory management:**
- Track source session/event
- Record extraction method
- Timestamp of creation

**During inference:**
- Provide context about memory origin
- Weight memories by reliability
- Enable memory deprecation

### Production Memory Considerations

**Privacy and Security Risks:**
- PII exposure in memories
- Cross-user data leakage
- Sanitize application-level memories

**Best Practices:**
- Redact PII before storage
- Implement strict access controls
- Audit memory generation for sensitive content
- Regular memory validation and cleanup
