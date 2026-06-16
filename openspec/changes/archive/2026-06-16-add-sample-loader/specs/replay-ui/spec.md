# Replay UI Spec Delta

## ADDED Requirements

### Requirement: Bundled Sample Loading

The app SHALL let users load bundled sample JSONL traces from the UI without
selecting a local file.

#### Scenario: User loads bundled sample

- **GIVEN** the app is showing any run
- **WHEN** the user selects a bundled sample
- **THEN** the app loads and parses that sample JSONL
- **AND** replaces the current run with the sample run
- **AND** selects the first event

#### Scenario: Bundled sample fails to load

- **GIVEN** the app is showing a valid run
- **WHEN** loading a bundled sample fails
- **THEN** the app keeps the current run
- **AND** shows a visible error
