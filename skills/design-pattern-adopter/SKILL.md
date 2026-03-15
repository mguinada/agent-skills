---
name: design-pattern-adopter
description: |
  Guide for analyzing code and selecting appropriate GoF design patterns. Use when: refactoring code for better structure, solving recurring design problems, discussing object-oriented architecture, implementing creational/structural/behavioral patterns, decoupling components, managing object creation, or organizing complex class hierarchies.

  **PROACTIVE ACTIVATION**: Auto-invoke when:
  - User asks about design patterns, architecture, or code organization
  - Code has multiple similar subclasses or deep inheritance hierarchies
  - User mentions coupling, cohesion, or code smell issues
  - Implementing factories, builders, singletons, adapters, or observers
  - Discussion involves "how to structure" or "how to organize" code
  - When reviweing and/or refactoring code

  **DETECTION**: Check for:
  - Large conditional statements switching on object type
  - Multiple classes with similar structure but slight variations
  - Tight coupling between classes that should be independent
  - Complex object construction logic
  - Need to add behavior without modifying existing classes
author: mguinada
version: 1.0.0
tags: [design-patterns, architecture, refactoring, oop, gof]
---

# Design Pattern Adopter

A comprehensive guide to the 23 Gang of Four (GoF) design patterns for analyzing implementations and selecting appropriate patterns when they genuinely fit the problem.

## How to Use This Skill

1. **Quick Reference**: Start here for pattern summaries and quick decisions
2. **Deep Dive**: Read the appropriate reference file when you need detailed implementation guidance
3. **Pattern Selection**: Evaluate each pattern against your specific problem—only apply when there's a genuine fit

## Pattern Catalog

### Creational Patterns (5)
*Object creation mechanisms*

| Pattern | Intent | When to Use |
|---------|--------|-------------|
| **Factory Method** | Define interface for creating objects, let subclasses decide which class to instantiate | When you don't know exact types beforehand, or want to extend internal components |
| **Abstract Factory** | Produce families of related objects without specifying concrete classes | When code needs to work with various families of related products |
| **Builder** | Construct complex objects step by step | When object has many optional parameters or complex construction |
| **Prototype** | Clone existing objects without depending on their classes | When copying objects is cheaper than creation, or reducing subclasses |
| **Singleton** | Ensure a class has only one instance with global access | When you need strict control over global variables or single instance |

### Structural Patterns (7)
*Composing classes and objects into larger structures*

| Pattern | Intent | When to Use |
|---------|--------|-------------|
| **Adapter** | Allow incompatible interfaces to work together | When you want to use existing class with incompatible interface |
| **Bridge** | Separate abstraction from implementation so both can vary independently | When you need to extend class in multiple orthogonal dimensions |
| **Composite** | Compose objects into tree structures, work uniformly with individual and compositions | When you have tree-like object structure and want uniform handling |
| **Decorator** | Attach new behaviors to objects by placing them in wrapper objects | When you need to add behaviors at runtime without inheritance |
| **Facade** | Provide simplified interface to complex subsystem | When you need limited but straightforward interface to complex subsystem |
| **Flyweight** | Share common parts of state between multiple objects | When RAM is constrained and many similar objects exist |
| **Proxy** | Provide placeholder for another object to control access | When you need lazy initialization, access control, logging, or caching |

### Behavioral Patterns (10)
*Object interaction and responsibility distribution*

| Pattern | Intent | When to Use |
|---------|--------|-------------|
| **Chain of Responsibility** | Pass requests along chain of handlers | When multiple handlers may process a request in sequence |
| **Command** | Convert requests into stand-alone objects | When you need to queue, schedule, undo operations, or parameterize objects |
| **Iterator** | Traverse collection elements without exposing underlying structure | When you want uniform traversal over different collection types |
| **Mediator** | Reduce dependencies between objects via mediator object | When objects communicate in complex ways and you want to reduce coupling |
| **Memento** | Save and restore object's previous state | When you need to implement undo without violating encapsulation |
| **Observer** | Define subscription mechanism to notify multiple objects of events | When changes to one object require changing others, and objects are unknown |
| **State** | Alter behavior when internal state changes | When object behavior depends on state and changes at runtime |
| **Strategy** | Define family of algorithms and make them interchangeable | When you need different variants of an algorithm at runtime |
| **Template Method** | Define algorithm skeleton in superclass, let subclasses override steps | When you want to let clients extend specific algorithm steps |
| **Visitor** | Separate algorithms from objects they operate on | When you need to perform operations on all elements of complex structure |

## Pattern Selection Guide

### By Problem Type

**Object Creation Too Complex?**
- Multiple constructors with many parameters → **Builder**
- Need families of related objects → **Abstract Factory**
- Need to delegate creation to subclasses → **Factory Method**
- Need to clone objects → **Prototype**
- Need single global instance → **Singleton**

**Classes Too Coupled?**
- Incompatible interfaces → **Adapter**
- Abstraction and implementation tangled → **Bridge**
- Tree structure handling → **Composite**
- Need runtime behavior addition → **Decorator**
- Complex subsystem → **Facade**
- Too many similar objects consuming RAM → **Flyweight**
- Need to control access → **Proxy**

**Behavior Hard to Change?**
- Request handling chain → **Chain of Responsibility**
- Need undo/operations as objects → **Command**
- Collection traversal → **Iterator**
- Complex communication between objects → **Mediator**
- State snapshots → **Memento**
- Event notification → **Observer**
- Behavior depends on state → **State**
- Need swappable algorithms → **Strategy**
- Algorithm with customizable steps → **Template Method**
- Operations on complex structures → **Visitor**

### By Code Smell

| Code Smell | Patterns to Consider |
|------------|---------------------|
| Large switch/if-else on type | State, Strategy, Factory Method |
| Many similar subclasses | Prototype, Decorator, Template Method |
| Tight coupling | Adapter, Bridge, Facade, Mediator |
| Complex constructors | Builder, Factory Method, Abstract Factory |
| Duplicated code across classes | Template Method, Strategy, Decorator |
| Hard to add new behavior | Visitor, Decorator, Command |
| Object creation logic scattered | Factory Method, Abstract Factory |

## Anti-Patterns: When NOT to Use Design Patterns

Design patterns add complexity. Don't use them when:

1. **The problem is simple** - A direct solution is clearer than a pattern
2. **The pattern is speculative** - "We might need this later" is not a reason
3. **You're forcing a fit** - If it doesn't naturally solve your problem, don't use it
4. **The team doesn't understand it** - Patterns should communicate intent, not confuse
5. **Premature optimization** - Don't add patterns for flexibility you don't need

> **Rule of thumb**: Start with the simplest solution that works. Apply a pattern only when the complexity it addresses becomes real.

## Detailed Reference Files

For comprehensive implementation guidance including structure, pseudocode, and examples:

- **Creational Patterns**: See `references/creational.md`
- **Structural Patterns**: See `references/structural.md`
- **Behavioral Patterns**: See `references/behavioral.md`

Each reference includes:
- Intent and problem statement
- Real-world analogy
- UML structure (Mermaid diagrams)
- Pseudocode implementation
- Applicability criteria
- Step-by-step implementation guide
- Pros and cons
- Relations to other patterns

## Quick Decision Flowchart

```
START: What problem are you solving?
│
├─► Creating objects?
│   ├─► Family of related objects? → Abstract Factory
│   ├─► Delegate to subclass? → Factory Method
│   ├─► Complex multi-step construction? → Builder
│   ├─► Clone existing objects? → Prototype
│   └─► Single instance needed? → Singleton
│
├─► Structuring classes/objects?
│   ├─► Incompatible interfaces? → Adapter
│   ├─► Multiple dimensions of variation? → Bridge
│   ├─► Tree structure? → Composite
│   ├─► Add behavior dynamically? → Decorator
│   ├─► Simplify complex subsystem? → Facade
│   ├─► Many similar objects (memory)? → Flyweight
│   └─► Control access to object? → Proxy
│
└─► Object interaction/behavior?
    ├─► Chain of handlers? → Chain of Responsibility
    ├─► Operations as objects (undo, queue)? → Command
    ├─► Traverse collections? → Iterator
    ├─► Reduce complex communication? → Mediator
    ├─► Save/restore state? → Memento
    ├─► Event subscription? → Observer
    ├─► Behavior changes with state? → State
    ├─► Swappable algorithms? → Strategy
    ├─► Algorithm with customizable steps? → Template Method
    └─► Operations on object structure? → Visitor
```

## Pattern Relationships

Many patterns work together or are alternatives:

- **Factory Method** is often used within **Template Method**
- **Abstract Factory** is often built using **Factory Method** or **Prototype**
- **Builder** can be used with **Bridge** (director as abstraction, builders as implementation)
- **Composite** often uses **Iterator**, **Visitor**, and **Chain of Responsibility**
- **Decorator** and **Proxy** have similar structures but different intents
- **State** and **Strategy** have identical structures but states can transition between each other
- **Mediator** can use **Observer** for communication

When selecting patterns, consider which combinations naturally complement each other.
