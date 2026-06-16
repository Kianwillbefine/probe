# Trace Writer Spec

## Purpose

The trace writer turns agent runtime events into local Probe JSONL files that
can be imported into the replay UI.

## Requirements

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

### Requirement: AI SDK Core Mock Trace

The project SHALL include a deterministic AI SDK Core mock-provider trace
generator that records real AI SDK tool lifecycle callbacks.

#### Scenario: User generates AI SDK Core mock trace

- **WHEN** the user runs `pnpm demo:ai-sdk-core`
- **THEN** the project writes `.probe/runs/ai-sdk-core-mock.jsonl`
- **AND** the trace contains user, model, tool call, tool result, and assistant
  output events
- **AND** the trace can be imported into the replay UI

### Requirement: AI SDK Probe Helper

The project SHALL provide a helper that returns AI SDK Core-compatible callbacks
for recording Probe JSONL traces.

#### Scenario: User records an AI SDK Core run with helper callbacks

- **GIVEN** the user creates a Probe helper with run id, model, and prompt
- **WHEN** the helper callbacks are passed to an AI SDK Core generation call
- **THEN** the helper records user, model, tool call, tool result, and assistant
  output events
- **AND** the helper can serialize the run to valid Probe JSONL
