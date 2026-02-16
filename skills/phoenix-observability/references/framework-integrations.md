# Phoenix Framework Integrations

Phoenix provides auto-instrumentation for a wide range of LLM frameworks, agent libraries, and provider SDKs.

## Table of Contents

- [Python Frameworks](#python-frameworks)
  - [Agentic Frameworks](#agentic-frameworks)
  - [RAG Frameworks](#rag-frameworks)
  - [LLM Providers](#llm-providers)
- [TypeScript/JavaScript](#typescriptjavascript)
- [Java](#java)
- [Platforms](#platforms)

## Python Frameworks

### Agentic Frameworks

#### Agno

**Installation:**
```bash
pip install openinference-instrumentation-agno
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.agno import AgnoInstrumentor

tracer_provider = register(project_name="agno-app")
AgnoInstrumentor().instrument(tracer_provider=tracer_provider)

# All Agno operations are traced
from agno import Agent, Task, Crew

agent = Agent(
    name="research_agent",
    role="Research Assistant",
    model="gpt-4o"
)

task = Task(
    description="Research Phoenix observability",
    agent=agent
)

result = task.execute()
```

**Documentation:** https://docs.arize.com/phoenix/integrations/agno

---

#### AutoGen

**Installation:**
```bash
pip install openinference-instrumentation-autogen
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.autogen import AutoGenInstrumentor

tracer_provider = register(project_name="autogen-app")
AutoGenInstrumentor().instrument(tracer_provider=tracer_provider)

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

**Documentation:** https://docs.arize.com/phoenix/integrations/autogen

---

#### BeeAI

**Installation:**
```bash
pip install openinference-instrumentation-beeai
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.beeai import BeeAIInstrumentor

tracer_provider = register(project_name="beeai-app")
BeeAIInstrumentor().instrument(tracer_provider=tracer_provider)

from beeai import Agent

agent = Agent(
    name="assistant",
    instructions="You are a helpful assistant"
)

response = agent.run("Hello!")
```

---

#### CrewAI

**Installation:**
```bash
pip install openinference-instrumentation-crewai
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.crewai import CrewAIInstrumentor

tracer_provider = register(project_name="crewai-app")
CrewAIInstrumentor().instrument(tracer_provider=tracer_provider)

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

result = crew.kickoff()
```

**Documentation:** https://docs.arize.com/phoenix/integrations/crewai

---

#### DSPy

**Installation:**
```bash
pip install openinference-instrumentation-dspy
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.dspy import DSPyInstrumentor

tracer_provider = register(project_name="dspy-app")
DSPyInstrumentor().instrument(tracer_provider=tracer_provider)

import dspy

lm = dspy.OpenAI(model="gpt-4o")
dspy.settings.configure(lm=lm)

class RAG(dspy.Module):
    def forward(self, query):
        context = self.retrieve(query)
        return self.generate(context=context, query=query)

rag = RAG()
result = rag(query="What is DSPy?")
```

**Documentation:** https://docs.arize.com/phoenix/integrations/dspy

---

#### Google ADK

**Installation:**
```bash
pip install openinference-instrumentation-google-adk
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.google_adk import GoogleADKInstrumentor

tracer_provider = register(project_name="google-adk-app")
GoogleADKInstrumentor().instrument(tracer_provider=tracer_provider)

from google.adk import Agent

agent = Agent(
    name="assistant",
    model="gemini-2.0-flash-exp"
)

response = agent.run("Hello!")
```

---

#### Guardrails AI

**Installation:**
```bash
pip install openinference-instrumentation-guardrails
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.guardrails import GuardrailsInstrumentor

tracer_provider = register(project_name="guardrails-app")
GuardrailsInstrumentor().instrument(tracer_provider=tracer_provider)

from guardrails import Guard

guard = Guard.from_rail("rail.xml")
response = guard.parse("user input")
```

---

#### Hugging Face smolagents

**Installation:**
```bash
pip install openinference-instrumentation-smolagents
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.smolagents import SmolAgentsInstrumentor

tracer_provider = register(project_name="smolagents-app")
SmolAgentsInstrumentor().instrument(tracer_provider=tracer_provider)

from smolagents import CodeAgent

agent = CodeAgent(model="HuggingFaceH4/zephyr-7b-beta")
agent.run("Calculate 2 + 2")
```

---

#### Instructor

**Installation:**
```bash
pip install openinference-instrumentation-instructor
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.instructor import InstructorInstrumentor

tracer_provider = register(project_name="instructor-app")
InstructorInstrumentor().instrument(tracer_provider=tracer_provider)

import instructor
from openai import OpenAI

client = instructor.from_openai(OpenAI())
response = client.chat.completions.create(
    model="gpt-4o",
    response_model=MyModel,
    messages=[{"role": "user", "content": "Extract data"}]
)
```

---

#### Portkey

**Installation:**
```bash
pip install openinference-instrumentation-portkey
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.portkey import PortkeyInstrumentor

tracer_provider = register(project_name="portkey-app")
PortkeyInstrumentor().instrument(tracer_provider=tracer_provider)

from portkey import Portkey

client = Portkey(
    api_key="your-api-key",
    virtual_key="your-virtual-key"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

---

#### Pydantic AI

**Installation:**
```bash
pip install openinference-instrumentation-pydantic-ai
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.pydantic_ai import PydanticAIInstrumentor

tracer_provider = register(project_name="pydantic-ai-app")
PydanticAIInstrumentor().instrument(tracer_provider=tracer_provider)

from pydantic_ai import Agent

agent = Agent(name="assistant", model="gpt-4o")
result = agent.run("Hello!")
```

**Documentation:** https://docs.arize.com/phoenix/integrations/pydantic-ai

### RAG Frameworks

#### LlamaIndex

**Installation:**
```bash
pip install openinference-instrumentation-llama-index
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.llama_index import LlamaIndexInstrumentor

tracer_provider = register(project_name="llamaindex-app")
LlamaIndexInstrumentor().instrument(tracer_provider=tracer_provider)

from llama_index import VectorStoreIndex, SimpleDirectoryReader

documents = SimpleDirectoryReader('data').load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
response = query_engine.query("What is in the documents?")
```

**Workflows Support:**
```python
from llama_index.core.workflow import Workflow

# LlamaIndex workflows are also traced
workflow = MyWorkflow()
result = workflow.run(query="test")
```

**Documentation:** https://docs.arize.com/phoenix/integrations/llamaindex

---

#### LangChain

**Installation:**
```bash
pip install openinference-instrumentation-langchain
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.langchain import LangChainInstrumentor

tracer_provider = register(project_name="langchain-app")
LangChainInstrumentor().instrument(tracer_provider=tracer_provider)

from langchain_openai import ChatOpenAI
from langchain.chains import ConversationChain

llm = ChatOpenAI(model="gpt-4o")
chain = ConversationChain(llm=llm)
response = chain.run("Hello!")
```

**Documentation:** https://docs.arize.com/phoenix/integrations/langchain

---

#### LangGraph

**Installation:**
```bash
pip install openinference-instrumentation-langgraph
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.langgraph import LangGraphInstrumentor

tracer_provider = register(project_name="langgraph-app")
LangGraphInstrumentor().instrument(tracer_provider=tracer_provider)

from langgraph.graph import StateGraph

graph = StateGraph(MyState)
# ... define graph ...
app = graph.compile()
result = app.invoke({"messages": ["Hello"]})
```

**Documentation:** https://docs.arize.com/phoenix/integrations/langgraph

---

#### Haystack

**Installation:**
```bash
pip install openinference-instrumentation-haystack
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.haystack import HaystackInstrumentor

tracer_provider = register(project_name="haystack-app")
HaystackInstrumentor().instrument(tracer_provider=tracer_provider)

from haystack import Pipeline

pipeline = Pipeline()
# ... add components ...
result = pipeline.run(data={"query": "test"})
```

### LLM Providers

#### OpenAI

**Installation:**
```bash
pip install openinference-instrumentation-openai
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.openai import OpenAIInstrumentor

tracer_provider = register(project_name="openai-app")
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)

from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**OpenAI Agents SDK:**
```bash
pip install openinference-instrumentation-openai-agents
```

**Documentation:** https://docs.arize.com/phoenix/integrations/openai

---

#### Anthropic

**Installation:**
```bash
pip install openinference-instrumentation-anthropic
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.anthropic import AnthropicInstrumentor

tracer_provider = register(project_name="anthropic-app")
AnthropicInstrumentor().instrument(tracer_provider=tracer_provider)

from anthropic import Anthropic

client = Anthropic()
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**Documentation:** https://docs.arize.com/phoenix/integrations/anthropic

---

#### Amazon Bedrock

**Installation:**
```bash
pip install openinference-instrumentation-bedrock
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.bedrock import BedrockInstrumentor

tracer_provider = register(project_name="bedrock-app")
BedrockInstrumentor().instrument(tracer_provider=tracer_provider)

import boto3

client = boto3.client('bedrock-runtime')
response = client.invoke_model(
    ModelId='anthropic.claude-3-sonnet-20240229-v1:0',
    Body='{"prompt": "Hello!"}'
)
```

**Documentation:** https://docs.arize.com/phoenix/integrations/bedrock

---

#### Google (GenAI / Gemini / VertexAI)

**Installation:**
```bash
pip install openinference-instrumentation-google
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.genai import GenAIInstrumentor

tracer_provider = register(project_name="google-app")
GenAIInstrumentor().instrument(tracer_provider=tracer_provider)

import google.generativeai as genai

genai.configure(api_key="your-api-key")
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content("Hello!")
```

**Documentation:** https://docs.arize.com/phoenix/integrations/google

---

#### MistralAI

**Installation:**
```bash
pip install openinference-instrumentation-mistralai
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.mistralai import MistralAIInstrumentor

tracer_provider = register(project_name="mistralai-app")
MistralAIInstrumentor().instrument(tracer_provider=tracer_provider)

from mistralai import Mistral

client = Mistral(api_key="your-api-key")
response = client.chat.complete(
    model="mistral-large",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**Documentation:** https://docs.arize.com/phoenix/integrations/mistralai

---

#### Groq

**Installation:**
```bash
pip install openinference-instrumentation-groq
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.groq import GroqInstrumentor

tracer_provider = register(project_name="groq-app")
GroqInstrumentor().instrument(tracer_provider=tracer_provider)

from groq import Groq

client = Groq(api_key="your-api-key")
response = client.chat.completions.create(
    model="llama3-70b-8192",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**Documentation:** https://docs.arize.com/phoenix/integrations/groq

---

#### LiteLLM

**Installation:**
```bash
pip install openinference-instrumentation-litellm
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.litellm import LiteLLMInstrumentor

tracer_provider = register(project_name="litellm-app")
LiteLLMInstrumentor().instrument(tracer_provider=tracer_provider)

from litellm import completion

response = completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**Documentation:** https://docs.arize.com/phoenix/integrations/litellm

---

#### OpenRouter

**Installation:**
```bash
pip install openinference-instrumentation-openrouter
```

**Usage:**
```python
from phoenix.otel import register
from openinference.instrumentation.openrouter import OpenRouterInstrumentor

tracer_provider = register(project_name="openrouter-app")
OpenRouterInstrumentor().instrument(tracer_provider=tracer_provider)

from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="your-api-key"
)

response = client.chat.completions.create(
    model="anthropic/claude-3-sonnet",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

**Documentation:** https://docs.arize.com/phoenix/integrations/openrouter

## TypeScript/JavaScript

### Mastra

**Installation:**
```bash
npm install @arizeai/openinference-instrumentation-mastra
```

**Usage:**
```typescript
import { registerTracerProvider } from '@arizeai/phoenix';
import { MastraInstrumentation } from '@arizeai/openinference-instrumentation-mastra';

registerTracerProvider({
  endpoint: 'http://localhost:6006/v1/traces',
  projectName: 'mastra-app'
});

MastraInstrumentation.instrument();

// All Mastra operations are traced
```

**Documentation:** https://docs.arize.com/phoenix/integrations/mastra

---

### LangChain.js

**Installation:**
```bash
npm install @arizeai/openinference-instrumentation-langchain
```

**Usage:**
```typescript
import { registerTracerProvider } from '@arizeai/phoenix';
import { LangChainInstrumentation } from '@arizeai/openinference-instrumentation-langchain';

registerTracerProvider({
  endpoint: 'http://localhost:6006/v1/traces',
  projectName: 'langchain-js-app'
});

LangChainInstrumentation.instrument();
```

**Documentation:** https://docs.arize.com/phoenix/integrations/langchain-js

---

### Vercel AI SDK

**Installation:**
```bash
npm install @arizeai/openinference-instrumentation-vercel-ai-sdk
```

**Usage:**
```typescript
import { registerTracerProvider } from '@arizeai/phoenix';
import { VercelAIInstrumentation } from '@arizeai/openinference-instrumentation-vercel-ai-sdk';

registerTracerProvider({
  endpoint: 'http://localhost:6006/v1/traces',
  projectName: 'vercel-ai-app'
});

VercelAIInstrumentation.instrument();
```

**Documentation:** https://docs.arize.com/phoenix/integrations/vercel-ai-sdk

---

### BeeAI (TypeScript)

**Installation:**
```bash
npm install @arizeai/openinference-instrumentation-beeai
```

**Usage:**
```typescript
import { registerTracerProvider } from '@arizeai/phoenix';
import { BeeAIInstrumentation } from '@arizeai/openinference-instrumentation-beeai';

registerTracerProvider({
  endpoint: 'http://localhost:6006/v1/traces',
  projectName: 'beeai-js-app'
});

BeeAIInstrumentation.instrument();
```

**Documentation:** https://docs.arize.com/phoenix/integrations/beeai-js

## Java

### LangChain4j

**Installation (Maven):**
```xml
<dependency>
    <groupId>com.arize</groupId>
    <artifactId>openinference-instrumentation-langchain4j</artifactId>
    <version>1.0.0</version>
</dependency>
```

**Usage:**
```java
import com.arize.phoenix.OpenTelemetry;
import com.arize.instrumentation.langchain4j.LangChain4jInstrumentation;

OpenTelemetry.register(
    "http://localhost:6006/v1/traces",
    "langchain4j-app"
);

LangChain4jInstrumentation.instrument();

// All LangChain4j operations are traced
```

**Documentation:** https://docs.arize.com/phoenix/integrations/langchain4j

---

### Spring AI

**Installation (Maven):**
```xml
<dependency>
    <groupId>com.arize</groupId>
    <artifactId>openinference-instrumentation-spring-ai</artifactId>
    <version>1.0.0</version>
</dependency>
```

**Usage:**
```java
import com.arize.phoenix.OpenTelemetry;
import com.arize.instrumentation.springai.SpringAIInstrumentation;

OpenTelemetry.register(
    "http://localhost:6006/v1/traces",
    "spring-ai-app"
);

SpringAIInstrumentation.instrument();
```

**Documentation:** https://docs.arize.com/phoenix/integrations/spring-ai

---

### Arconia

**Installation (Maven):**
```xml
<dependency>
    <groupId>com.arize</groupId>
    <artifactId>openinference-instrumentation-arconia</artifactId>
    <version>1.0.0</version>
</dependency>
```

**Documentation:** https://docs.arize.com/phoenix/integrations/arconia

## Platforms

### Dify

**Integration:** Phoenix traces Dify workflows and agent executions.

**Documentation:** https://docs.arize.com/phoenix/integrations/dify

---

### Flowise

**Integration:** Phoenix traces Flowise flows and LLM calls.

**Documentation:** https://docs.arize.com/phoenix/integrations/flowise

---

### LangFlow

**Integration:** Phoenix traces LangFlow components and data flows.

**Documentation:** https://docs.arize.com/phoenix/integrations/langflow

---

### Prompt Flow

**Integration:** Phoenix traces Prompt Flow executions and LLM calls.

**Documentation:** https://docs.arize.com/phoenix/integrations/prompt-flow

## Evaluation Integrations

Phoenix can also use external models and libraries for running evaluations:

### Eval Models
- OpenAI
- Anthropic
- Google GenAI / Gemini
- VertexAI
- MistralAI
- Amazon Bedrock
- LiteLLM

### Eval Libraries
- Ragas
- Cleanlab

See the main skill documentation for evaluation examples.

## Installation Summary

All instrumentation libraries follow the naming pattern:
```
openinference-instrumentation-{framework}
```

Install with pip:
```bash
pip install openinference-instrumentation-{framework}
```

## Common Pattern

All instrumentations follow the same pattern:

1. **Register Phoenix tracer provider**
2. **Initialize the framework instrumentor**
3. **Import and use the framework**

```python
from phoenix.otel import register
from openinference.instrumentation.{framework} import {Framework}Instrumentor

# 1. Register tracer
tracer_provider = register(project_name="my-app")

# 2. Instrument framework
{Framework}Instrumentor().instrument(tracer_provider=tracer_provider)

# 3. Use framework (automatically traced)
from {framework} import {Module}
# All operations are traced
```

## Multiple Frameworks

You can instrument multiple frameworks simultaneously:

```python
from phoenix.otel import register
from openinference.instrumentation.openai import OpenAIInstrumentor
from openinference.instrumentation.langchain import LangChainInstrumentor
from openinference.instrumentation.llama_index import LlamaIndexInstrumentor

tracer_provider = register(project_name="multi-framework-app")

# Instrument all frameworks
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
LangChainInstrumentor().instrument(tracer_provider=tracer_provider)
LlamaIndexInstrumentor().instrument(tracer_provider=tracer_provider)
```
