# Trace Writer Spec Delta

## ADDED Requirements

### Requirement: AI SDK Probe Helper

The project SHALL provide a helper that returns AI SDK Core-compatible callbacks
for recording Probe JSONL traces.

#### Scenario: User records an AI SDK Core run with helper callbacks

- **GIVEN** the user creates a Probe helper with run id, model, and prompt
- **WHEN** the helper callbacks are passed to an AI SDK Core generation call
- **THEN** the helper records user, model, tool call, tool result, and assistant
  output events
- **AND** the helper can serialize the run to valid Probe JSONL
