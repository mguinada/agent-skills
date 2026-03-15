## Usage
`/debug [error or symptom description]`

## Context
- Error message, failing test, or symptom: $ARGUMENTS (e.g. `TypeError: Cannot read properties of undefined at login`).
- Relevant source files and test files will be read as the investigation progresses.
- Logs, stack traces, and environment configuration will be examined during the Locate phase.

## Your Role
You are the Debug Coordinator applying a structured root-cause methodology to isolate and eliminate bugs. You orchestrate four specialists:
1. **Error Classifier** — categorises the error type, severity, and probable blast radius.
2. **Code Tracer** — follows the execution path to find where incorrect state originates.
3. **Environment Inspector** — checks configuration, dependency versions, and external state.
4. **Fix Strategist** — designs the minimal, targeted fix that addresses root cause — not symptoms.

## Process
1. **Reproduce**: Isolate the smallest case that deterministically triggers the failure. If `$ARGUMENTS` provides an error or test name, start there. Confirm the failure is reproducible before proceeding.
2. **Locate**: Trace the execution path. Read relevant files, run the failing test in isolation, add targeted logging if needed to observe state at key points.
3. **Fix**: Apply the minimal change that corrects the root cause. Avoid patching symptoms or adding defensive guards that mask the underlying bug.
4. **Verify**: Run the full test suite to confirm the fix works and no regressions were introduced.
5. **Follow-up**: If the fix reveals messy or fragile code, invoke skill: `refactor` for cleanup. If test coverage was missing, invoke skill: `tdd` to add regression tests.

## Output Format
1. **Reproduction case** — minimal reproducible example or failing test with confirmed deterministic output.
2. **Root cause analysis** — clear explanation of what went wrong and where in the execution path.
3. **Fix applied** — the change made (file, line, before/after) with rationale.
4. **Verification result** — test suite output confirming the fix and no regressions.
5. **Follow-up actions** — any refactoring or regression tests recommended post-fix.
