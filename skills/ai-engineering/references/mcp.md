# Model Context Protocol (MCP)

The Model Context Protocol (MCP) is an open standard for connecting AI applications to external tools and data sources, addressing the "N×M integration problem."

## The Problem: N×M Integration

Without a standard protocol, connecting AI models to tools requires custom connectors for every pairing:

```
Model 1 → Tool A, Tool B, Tool C
Model 2 → Tool A, Tool B, Tool C
Model 3 → Tool A, Tool B, Tool C
```

This creates exponential complexity. MCP provides a unified protocol, enabling plug-and-play interoperability.

## Core Architecture

MCP implements a client-server model inspired by the Language Server Protocol (LSP):

### Components

| Component | Responsibility |
|-----------|----------------|
| **Host** | Manages user experience, orchestrates tools, enforces security policies |
| **Client** | Maintains server connections, issues commands, manages session lifecycle |
| **Server** | Advertises tools, executes commands, formats results, handles security/governance |

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    Host     │ ←──→ │   Client    │ ←──→ │   Server    │
│ (App/UI)    │      │ (Connector) │      │  (Tools)    │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Communication Layer

**Base Protocol:** JSON-RPC 2.0 (lightweight, language-agnostic)

**Message Types:**
- **Requests** - RPC calls expecting response
- **Results** - Successful outcomes
- **Errors** - Failure indications with codes
- **Notifications** - One-way messages (no reply)

**Transport Protocols:**
- **stdio** - Local communication, subprocess deployment
- **Streamable HTTP** - Remote communication, supports SSE streaming

## Server-Side Capabilities

### Tools

Standardized function definitions with JSON Schema:

```json
{
  "name": "get_stock_price",
  "title": "Stock Price Retrieval Tool",
  "description": "Get stock price for a specific ticker symbol...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "description": "Stock ticker symbol"
      }
    },
    "required": ["symbol"]
  }
}
```

**Annotations** (hints only, not guaranteed):
- `destructiveHint` - May perform destructive updates
- `idempotentHint` - Repeatable with same arguments
- `openWorldHint` - Interacts with external entities
- `readOnlyHint` - Does not modify environment

### Resources

Static data access (files, database records, schemas). Use with caution—validate and retrieve from trusted URLs only.

### Prompts

Reusable prompt templates related to tools/resources. **Security concern:** Allows third-party prompt injection. Use rarely, if at all.

## Client-Side Capabilities

### Sampling

Server can request LLM completion from client. Enables:
- Client control over LLM providers
- Cost borne by application developer
- Content guardrails at client level
- Human-in-the-loop approval

**Risk:** Prompt injection avenue. Filter and validate requests.

### Elicitation

Server can request additional user input from client via UI.

**Critical:** Servers MUST NOT request sensitive information. Implement strong guardrails.

### Roots

Define filesystem boundaries where servers can operate. Current spec restricted to `file:` URIs.

**Warning:** No guardrails around server behavior with roots. Don't rely solely on this.

## Benefits

**Development Acceleration**
- Reduced integration cost and time-to-market
- Plug-and-play tool ecosystem
- Public registries and marketplaces

**Agent Enhancement**
- Dynamic tool discovery at runtime
- Standardized tool descriptions
- Expanded capabilities via ecosystem

**Architectural Flexibility**
- Decouples agent architecture from capability implementation
- Modular, composable systems ("agentic mesh")
- Swappable LLM providers without re-architecture

**Governance Foundation**
- Security policies embedded in servers
- User consent and control principles
- Human-in-the-loop workflow support

## Challenges & Risks

### Performance Issues

**Context Window Bloat**
- All tool definitions loaded into prompt
- Increases cost, latency, reduces context for other data
- Can degrade reasoning quality

**Potential Solution:** RAG-like tool retrieval—search tool library, load only relevant definitions.

### Enterprise Readiness Gaps

| Gap | Status |
|-----|--------|
| Authentication/Authorization | OAuth implementation evolving |
| Identity Management | No standardized identity propagation |
| Observability | No native logging/tracing/metrics standards |

### Security Threats

**Dynamic Capability Injection**
- **Risk:** MCP servers or tool providers change available tools without notification, causing agents to inherit unauthorized capabilities
- **Example:** A poetry agent connects to a Books server for quotes, but the server adds a purchasing capability—suddenly the agent can make financial transactions
- **Mitigation:** Explicit tool allowlists, mandatory change notifications, tool version pinning, API gateways

**Tool Shadowing**
- **Risk:** Malicious tools use broader triggers to overshadow legitimate tools, intercepting sensitive operations
- **Example:** Malicious `save_secure_note` tool triggers on "save", "store", "keep"—overshadowing legitimate `secure_storage_service`
- **Mitigation:** Prevent naming collisions, mutual TLS, deterministic policy enforcement, human-in-the-loop for high-risk operations

**Confused Deputy Problem**
- **Risk:** Privileged server (deputy) tricked by less-privileged entity into misusing its authority
- **Example:** AI assistant asks MCP server to create a branch with sensitive code—server has permission but user doesn't
- **Mitigation:** Validate user permissions before executing server actions, never assume AI agent's authority equals user's

**Malicious Tool Definitions**
- **Risk:** Tool descriptors manipulate agent planners or consume external content with prompt injection
- **Example:** Tool descriptions designed to trigger on specific patterns, or tool results containing injectable prompts
- **Mitigation:** Input/output sanitization, separate system prompts, allowlist validation for resources

**Sensitive Information Leaks**
- **Risk:** Tools unintentionally receive or exfiltrate sensitive data through conversation context
- **Example:** User interaction history transmitted to tool, or Elicitation capability abused to gather sensitive info
- **Mitigation:** Structured outputs with taint tracking, scoped credentials, keep secrets out of agent context

**No Per-Tool Authorization**
- **Risk:** MCP only supports coarse-grained auth, no per-tool or per-resource scope
- **Mitigation:** Scoped credentials with audience validation, principle of least privilege, secrets transmitted via side channels

## Best Practices

### Security

1. **Implement multi-layered defense**
   - API gateways for policy enforcement
   - Hardened SDKs with explicit allowlists
   - Human-in-the-loop for high-risk operations

2. **Validate everything**
   - Sanitize tool descriptions before LLM context
   - Allowlist URLs for resource consumption
   - Verify token audience and scope

3. **Control access**
   - Restrict to approved MCP servers only
   - Host servers in controlled environments
   - Prevent access to local/unauthorized servers

### Tool Design for MCP

Follow all ACI best practices (see aci.md), plus:

1. **Include outputSchema** - Always define for validation and LLM guidance
2. **Use annotations carefully** - They're hints, not guarantees
3. **Descriptive error messages** - Guide LLM on error recovery
4. **Version tools** - Pin to specific versions for stability

### Implementation

```python
# Example: MCP Server (stdio transport)
from mcp.server import Server
from mcp.types import Tool, TextContent

server = Server("weather-server")

@server.tool()
async def get_weather(location: str) -> str:
    """Get current weather for a location.

    Args:
        location: City name or ZIP code

    Returns:
        Current weather conditions
    """
    # Implementation here
    return f"Weather for {location}: Sunny, 72°F"

# Server runs on stdio
```

## When to Use MCP

**Good for:**
- Multi-environment deployments
- Sharing tools across applications
- Dynamic tool discovery needs
- Ecosystem participation

**Consider alternatives for:**
- Simple, single-app deployments
- Highly sensitive operations (air-gap preferred)
- Performance-critical paths (context bloat)

## Future Directions

- Improved authentication/authorization standards
- Native observability primitives
- Enhanced security model for capabilities
- Dynamic tool retrieval architectures
