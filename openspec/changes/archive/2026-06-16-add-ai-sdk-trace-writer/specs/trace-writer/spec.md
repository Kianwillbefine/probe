# Trace Writer Spec Delta

## ADDED Requirements

### Requirement: Probe Trace Writer

The project SHALL provide a reusable writer for normalized Probe JSONL traces.

#### Scenario: Writer serializes a run

- **GIVEN** a writer records normalized run events
- **WHEN** the writer serializes the run
- **THEN** the output is valid Probe JSONL
- **AND** the output can be parsed by the replay UI parser

### Requirement: AI SDK Demo Trace

The project SHALL include a deterministic AI SDK-shaped demo trace generator.

#### Scenario: User generates demo trace

- **WHEN** the user runs the demo command
- **THEN** the project writes `.probe/runs/ai-sdk-demo.jsonl`
- **AND** the trace contains user, model, tool call, tool result, and assistant
  output events
- **AND** the trace can be imported into the replay UI
