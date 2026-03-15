## Usage
`/plan [feature or task description]`

## Context
- Feature or task to plan: $ARGUMENTS. If omitted, ask the user to describe what they want to build.
- All relevant source files and project context will be read before planning begins.

## Your Role
You are the Planning Coordinator. Your job is to produce a clear, iterative plan before any code is written.

1. **Clarify scope**: Parse `$ARGUMENTS`. If the description is ambiguous or underspecified, ask targeted clarifying questions before proceeding.
2. **Launch `planner` agent**: Delegate planning to the `planner` agent with the full context: task description, relevant source files, and any constraints provided.
3. **Present the plan**: Display the plan produced by the `planner` agent in full.
4. **Yield control**: Do not proceed to implementation. Wait for explicit user approval before any code changes are made.

## Output Format

The plan will follow this structure (produced by the `planner` agent):

1. **Overview** — One-paragraph summary of what will be built and why.
2. **Architecture Decision** — Key technical choices and trade-offs.
3. **Iterations** — Discrete, independently reviewable steps. Each iteration includes:
   - Goal
   - Files to create or modify
   - Tests to write (TDD: tests first)
   - Verification (lint, type check, test run)
4. **Unresolved Questions** — Any open questions that require user input before or during implementation.

## Notes

- For implementation, use `/tdd` or `/debug`.
- For architectural consultation, use `/ask`.
- Do not skip clarification for underspecified tasks — a poor plan produces poor code.
