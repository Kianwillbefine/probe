# Trace Writer Spec Delta

## ADDED Requirements

### Requirement: AI SDK Core Mock Trace

The project SHALL include a deterministic AI SDK Core mock-provider trace
generator that records real AI SDK tool lifecycle callbacks.

#### Scenario: User generates AI SDK Core mock trace

- **WHEN** the user runs `pnpm demo:ai-sdk-core`
- **THEN** the project writes `.probe/runs/ai-sdk-core-mock.jsonl`
- **AND** the trace contains user, model, tool call, tool result, and assistant
  output events
- **AND** the trace can be imported into the replay UI
