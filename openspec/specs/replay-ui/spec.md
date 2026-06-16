# Replay UI Spec

## Purpose

The replay UI shows one recorded agent run as a three-pane local debugger:
timeline, replay view, and inspector.

## Requirements

### Requirement: Workbench Shell

The app SHALL present a local workbench for inspecting a single agent run.

#### Scenario: Current mock run loads

- **WHEN** the app starts
- **THEN** it shows the bundled run title, run id, model, duration, event count,
  and tool call count
- **AND** it renders the timeline, replay view, and inspector

### Requirement: Timeline Selection

The app SHALL show ordered run events and allow selecting one active event.

#### Scenario: User selects an event

- **WHEN** the user clicks a timeline event
- **THEN** that event becomes active
- **AND** the replay view shows recorded state up to and including the selected
  event
- **AND** the inspector shows metadata and payload for the selected event

### Requirement: Event Status Visibility

The app SHALL make status differences visible in the timeline and inspector.

#### Scenario: Warning approval event appears

- **WHEN** the run contains an `approval_request` event with `warning` status
- **THEN** the timeline and inspector show warning styling for that event

#### Scenario: Running stream event appears

- **WHEN** the run contains an `assistant_delta` event with `running` status
- **THEN** the timeline and inspector show running styling for that event

### Requirement: Event Inspector

The app SHALL show the selected event as readable structured data.

#### Scenario: User inspects a tool call

- **WHEN** the user selects a `tool_call` event
- **THEN** the inspector shows event id, type, source, parent, duration, status,
  and formatted JSON payload

### Requirement: JSONL Trace Import

The app SHALL import a local JSONL trace file as a normalized agent run.

#### Scenario: Valid JSONL trace imports

- **GIVEN** a JSONL file with valid normalized events
- **WHEN** the user imports the file
- **THEN** the app replaces the current run with the imported run
- **AND** selects the first event
- **AND** shows the imported events in the timeline

#### Scenario: Invalid JSONL line fails clearly

- **GIVEN** a JSONL file with invalid JSON on line 3
- **WHEN** the user imports the file
- **THEN** the app keeps the previously loaded run
- **AND** shows an import error that mentions line 3

### Requirement: JSONL Trace Export

The app SHALL export the currently loaded run as JSONL.

#### Scenario: User exports current run

- **GIVEN** a run is loaded
- **WHEN** the user activates `Export JSONL`
- **THEN** the app downloads a `{runId}.jsonl` file
- **AND** the downloaded file can be imported again

### Requirement: Event Payload Copy

The app SHALL copy the selected event JSON from the inspector.

#### Scenario: User copies selected event

- **GIVEN** an event is selected
- **WHEN** the user activates `Copy`
- **THEN** the app writes formatted event JSON to the clipboard
- **AND** shows a copy success state
