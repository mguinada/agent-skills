# Phoenix Tracing Setup

Comprehensive guide for setting up tracing in agentic/LLM systems using Arize Phoenix with OpenTelemetry.

## Overview

Phoenix uses OpenTelemetry (OTLP) for trace collection. You can instrument your application using:
- **Automatic instrumentation**: Framework-specific libraries
- **Manual instrumentation**: Direct OpenTelemetry API usage

Both approaches send traces to the same Phoenix endpoint.

## Quick Setup

### 1. Install Dependencies

```bash
pip install arize-phoenix
pip install arize-phoenix-otel

# For automatic instrumentation
pip install openinference-instrumentation
```

### 2. Configure OpenTelemetry

```python
from phoenix.otel import register

# Configure OpenTelemetry with Phoenix
tracer_provider = register(
    project_name="my-llm-app",
    endpoint="http://localhost:6006/v1/traces"
)
```

## Manual Instrumentation

Use manual instrumentation for custom logic or when automatic instrumentation is unavailable.

### Framework-Agnostic Decorator Tracing

For **custom agentic systems** that don't use a framework, `openinference-instrumentation` provides decorators that simplify manual instrumentation:

```bash
pip install openinference-instrumentation
```

The `@tracer.agent`, `@tracer.chain`, and `@tracer.tool` decorators wrap any Python function to capture agent steps, tool calls, and chain logic with full OpenTelemetry-compatible tracing.

```python
from openinference.instrumentation import Instrumentor
from phoenix.otel import register

# Setup
tracer_provider = register(project_name="custom-agent")

# Create instrumentor with decorators
instrumentor = Instrumentor(tracer_provider=tracer_provider)

# Trace an entire agent loop
@instrumentor.agent  # Captures full agent execution
def research_agent(query: str) -> str:
    """Custom agent with manual tool dispatch."""
    context = search_tool(query)
    answer = synthesize_tool(context, query)
    return answer

# Trace individual tools
@instrumentor.tool  # Captures tool inputs/outputs
def search_tool(query: str) -> list:
    """Search vector database for relevant context."""
    return vector_store.search(query, top_k=5)

@instrumentor.tool
def synthesize_tool(context: list, query: str) -> str:
    """Generate response using retrieved context."""
    return llm.generate(query, context)

# Trace chain steps
@instrumentor.chain  # Captures sequential chain execution
def rag_chain(question: str) -> str:
    """Simple RAG chain."""
    docs = retriever.retrieve(question)
    return generator(question, docs)

# Run your traced agent
result = research_agent("What is Phoenix observability?")
```

**When to use decorators:**
- Building custom agent loops without LangChain/LlamaIndex
- Implementing tool dispatchers or orchestration logic
- Adding tracing to existing code without refactoring
- Preference for decorators over context managers

**Decorator differences:**
- `@tracer.agent` - Full agent execution with nested tool calls
- `@tracer.chain` - Sequential chain of operations
- `@tracer.tool` - Individual function/tool with input/output capture

### Basic Manual Tracing

```python
from opentelemetry import trace
from phoenix.otel import register

# Setup tracing
tracer_provider = register(project_name="my-app")
tracer = trace.get_tracer(__name__)

# Create spans
with tracer.start_as_current_span("process_request") as span:
    span.set_attribute("input.value", "user query")

    # Nested spans for sub-operations
    with tracer.start_as_current_span("retrieve_context"):
        context = retriever.search("user query")

    with tracer.start_as_current_span("generate_response"):
        response = llm.generate("user query", context)

    span.set_attribute("output.value", response)
```

### Custom Span Attributes

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

tracer = trace.get_tracer(__name__)

def process_user_request(user_id: str, query: str):
    with tracer.start_as_current_span("process_request") as span:
        # Add custom attributes
        span.set_attribute("user.id", user_id)
        span.set_attribute("input.query", query)
        span.set_attribute("request.timestamp", datetime.now().isoformat())

        try:
            result = handle_query(query)
            span.set_attribute("output.success", True)
            span.set_status(StatusCode.OK)
            return result
        except Exception as e:
            span.record_exception(e)
            span.set_status(StatusCode.ERROR, str(e))
            span.set_attribute("error.type", type(e).__name__)
            raise
```

### Distributed Tracing

```python
from opentelemetry import trace
from opentelemetry.trace import propagate
import requests

tracer = trace.get_tracer(__name__)

# Service A: Inject trace context
def call_downstream_service(data):
    headers = {}
    propagate.inject(headers)  # Inject trace context

    response = requests.post(
        "http://service-b/api/process",
        json=data,
        headers=headers
    )
    return response.json()

# Service B: Extract trace context
from flask import Flask, request

app = Flask(__name__)

@app.route("/api/process", methods=["POST"])
def process():
    # Extract trace context from incoming headers
    context = propagate.extract(request.headers)

    with tracer.start_as_current_span("service_b_process", context=context):
        result = process_data(request.json)
        return {"result": result}
```

### Span Events

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_with_events(query: str):
    with tracer.start_as_current_span("complex_process") as span:
        span.add_event(
            name="process_started",
            attributes={"query": query}
        )

        # Step 1
        step1_result = step1(query)
        span.add_event(
            name="step1_completed",
            attributes={"result_count": len(step1_result)}
        )

        # Step 2
        step2_result = step2(step1_result)
        span.add_event(
            name="step2_completed",
            attributes={"final_result": step2_result}
        )

        return step2_result
```

## Automatic Instrumentation

Automatic instrumentation uses framework-specific libraries to capture traces without code changes.

### OpenAI SDK

```python
from phoenix.otel import register
from openinference.instrumentation.openai import OpenAIInstrumentor

# Setup
tracer_provider = register(project_name="my-app")
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)

# Use OpenAI - all calls are automatically traced
from openai import OpenAI
client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Anthropic SDK

```python
from phoenix.otel import register
from openinference.instrumentation.anthropic import AnthropicInstrumentor

# Setup
tracer_provider = register(project_name="my-app")
AnthropicInstrumentor().instrument(tracer_provider=tracer_provider)

# Use Anthropic - all calls are automatically traced
from anthropic import Anthropic
client = Anthropic()
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### LangChain

```python
from phoenix.otel import register
from openinference.instrumentation.langchain import LangChainInstrumentor

# Setup
tracer_provider = register(project_name="my-app")
LangChainInstrumentor().instrument(tracer_provider=tracer_provider)

# Use LangChain - all operations are automatically traced
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationChain

llm = ChatOpenAI(model="gpt-4o")
chain = ConversationChain(llm=llm)
response = chain.run("Hello!")
```

### LlamaIndex

```python
from phoenix.otel import register
from openinference.instrumentation.llama_index import LlamaIndexInstrumentor

# Setup
tracer_provider = register(project_name="my-app")
LlamaIndexInstrumentor().instrument(tracer_provider=tracer_provider)

# Use LlamaIndex - all operations are automatically traced
from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader('data').load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
response = query_engine.query("What is in the documents?")
```

## Agentic Framework Instrumentation

### DSPy

```python
from phoenix.otel import register
from openinference.instrumentation.dspy import DSPyInstrumentor

# Setup
tracer_provider = register(project_name="dspy-app")
DSPyInstrumentor().instrument(tracer_provider=tracer_provider)

# Use DSPy - all operations are automatically traced
import dspy

lm = dspy.OpenAI(model="gpt-4o")
dspy.settings.configure(lm=lm)

class RAG(dspy.Module):
    def forward(self, query):
        # DSPy operations are traced
        context = self.retrieve(query)
        return self.generate(context=context, query=query)

rag = RAG()
result = rag(query="What is DSPy?")
```

### Agno

```python
from phoenix.otel import register
from openinference.instrumentation.agno import AgnoInstrumentor

# Setup
tracer_provider = register(project_name="agno-app")
AgnoInstrumentor().instrument(tracer_provider=tracer_provider)

# Use Agno - all operations are automatically traced
from agno import Agent, Task

agent = Agent(
    name="research_agent",
    role="Research Assistant",
    goals=["Gather information on topics"]
)

task = Task(
    description="Research Phoenix observability",
    agent=agent,
    expected_output="Summary of Phoenix features"
)

result = task.execute()  # Automatically traced
```

### AutoGen

```python
from phoenix.otel import register
from openinference.instrumentation.autogen import AutoGenInstrumentor

# Setup
tracer_provider = register(project_name="autogen-app")
AutoGenInstrumentor().instrument(tracer_provider=tracer_provider)

# Use AutoGen - all operations are automatically traced
import autogen

assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4"}
)

user_proxy = autogen.UserProxyAgent(
    name="user_proxy",
    code_execution_config={"work_dir": "coding"}
)

user_proxy.initiate_chat(
    assistant,
    message="Write a hello world program"
)
```

### CrewAI

```python
from phoenix.otel import register
from openinference.instrumentation.crewai import CrewAIInstrumentor

# Setup
tracer_provider = register(project_name="crewai-app")
CrewAIInstrumentor().instrument(tracer_provider=tracer_provider)

# Use CrewAI - all operations are automatically traced
from crewai import Agent, Task, Crew

researcher = Agent(
    role='Researcher',
    goal='Research AI topics',
    backstory='You are an AI researcher'
)

task = Task(
    description='Research Phoenix observability',
    agent=researcher
)

crew = Crew(
    agents=[researcher],
    tasks=[task],
    verbose=True
)

result = crew.kickoff()  # Automatically traced
```

## Configuration Options

### Environment Variables

```bash
# Phoenix endpoint
export PHOENIX_COLLECTOR_ENDPOINT="http://localhost:6006/v1/traces"
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:6006/v1/traces"

# Project name
export PHOENIX_PROJECT_NAME="my-llm-app"

# Sampling
export OTEL_TRACES_SAMPLER="traceidratio"
export OTEL_TRACES_SAMPLER_ARG="1.0"  # 100% sampling

# Batch processing
export OTEL_BSP_SCHEDULE_DELAY_MILLIS="5000"
export OTEL_BSP_MAX_EXPORT_BATCH_SIZE="512"
```

### Programmatic Configuration

```python
from phoenix.otel import register
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource

# Create custom resource
resource = Resource.create({
    "service.name": "my-service",
    "service.version": "1.0.0",
    "deployment.environment": "production"
})

# Configure with options
tracer_provider = register(
    project_name="my-app",
    endpoint="http://localhost:6006/v1/traces",
    resource=resource,
)

# Configure batch processor
from opentelemetry.sdk.trace import TracerProvider
provider = TracerProvider(resource=resource)
provider.add_span_processor(BatchSpanProcessor(
    exporter=OTLPSpanExporter(endpoint="http://localhost:6006/v1/traces"),
    max_queue_size=2048,
    schedule_delay_millis=5000,
    max_export_batch_size=512,
))
```

## Best Practices

### 1. Project Organization

```python
import os

# Use separate projects for environments
ENV = os.environ.get("ENV", "dev")
project_name = f"my-app-{ENV}"

tracer_provider = register(project_name=project_name)
```

### 2. Error Handling

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

tracer = trace.get_tracer(__name__)

def safe_operation():
    with tracer.start_as_current_span("safe_operation") as span:
        try:
            result = risky_operation()
            span.set_status(StatusCode.OK)
            return result
        except Exception as e:
            span.record_exception(e)
            span.set_status(StatusCode.ERROR, str(e))
            span.set_attribute("error.message", str(e))
            raise
```

### 3. Attribute Naming

```python
# Use OpenInference semantic conventions
from openinference.semconv.trace import SpanAttributes

span.set_attribute(SpanAttributes.INPUT_VALUE, "user query")
span.set_attribute(SpanAttributes.OUTPUT_VALUE, "response")
span.set_attribute(SpanAttributes.LLM_MODEL_NAME, "gpt-4o")
span.set_attribute(SpanAttributes.LLM_TOKEN_COUNT_TOTAL, 1500)
```

### 4. Sampling for High-Volume Applications

```python
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

# Sample 10% of traces in production
tracer_provider = register(
    project_name="my-app",
    sampler=TraceIdRatioBased(0.1)
)
```

## Troubleshooting

### Traces Not Appearing

```python
# 1. Verify endpoint is correct
endpoint = "http://localhost:6006/v1/traces"  # Note: /v1/traces is required

# 2. Force flush
from opentelemetry import trace
trace.get_tracer_provider().force_flush()

# 3. Check Phoenix is running
import requests
requests.get("http://localhost:6006/healthz")
```

### Missing Spans

```python
# Ensure instrumentor is called before importing the instrumented library
from openinference.instrumentation.openai import OpenAIInstrumentor
from phoenix.otel import register

# Register FIRST
tracer_provider = register()

# Instrument SECOND
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)

# Import LAST
from openai import OpenAI  # Now OpenAI calls will be traced
```

### Memory Issues

```python
# Reduce batch size and queue size
tracer_provider = register(
    project_name="my-app",
    # Configure batch processor
    batch_export_max_batch_size=100,  # Reduce from default 512
    batch_export_max_queue_size=256,  # Reduce from default 2048
)
```
