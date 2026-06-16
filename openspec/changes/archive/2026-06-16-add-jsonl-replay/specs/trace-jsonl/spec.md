# Trace JSONL Spec Delta

## ADDED Requirements

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
