# Design: Add JSONL Replay

## Chosen Approach

Keep the app as a single Vite React application and add browser-side JSONL
import/export. JSONL is the durable trace contract because it is append-friendly,
easy to inspect, easy to diff, and simple to share.

The viewer should continue to render a single selected run. Import replaces the
current run in memory. Export downloads the current run in the same normalized
format.

## Trace File Contract

Default future writer path:

```text
.probe/runs/{runId}.jsonl
```

Browser import/export does not require the file to live at that path; it only
uses the JSONL format.

Rules:

- One UTF-8 JSON object per line.
- Empty lines are ignored.
- Events are sorted by `sequence` when present, otherwise by file order.
- Unknown fields are ignored safely by the UI if they are outside the supported
  fields.
- Adapter-specific details live in `payload`.
- Invalid lines produce an import error with the line number.
- Exported JSONL should be importable again without data loss for supported
  fields.

## Event Model

Each line contains one event.

Required fields:

- `runId`: stable id shared by all events in the run.
- `id`: stable event id.
- `timestamp`: ISO 8601 timestamp.
- `type`: normalized event type.
- `source`: event origin.
- `title`: short human-readable label.
- `summary`: one-sentence explanation for the timeline.
- `status`: `pending`, `running`, `success`, `warning`, or `error`.
- `payload`: JSON object with adapter-specific details.

Optional fields:

- `parentId`: id of the causal parent event.
- `durationMs`: event duration when known.
- `sequence`: monotonically increasing event order.
- `cost`: model/provider cost metadata when available.
- `tokens`: token metadata when available.

Normalized event types:

- `user_message`
- `model_call`
- `assistant_delta`
- `tool_call`
- `tool_result`
- `approval_request`
- `approval_result`
- `ui_event`
- `error`

Source values:

- `ui`
- `agent`
- `model`
- `tool`
- `human`
- `system`

## Run Metadata

JSONL events only require event-level data. The UI derives run metadata when a
sidecar manifest is absent:

- `id`: first event `runId`.
- `title`: first user message title or imported file name fallback.
- `status`: worst status across events, preferring `error`, then `warning`, then
  `running`, then `success`.
- `startedAt`: first event timestamp.
- `model`: first `model_call.payload.model` string, when present.
- `totalDurationMs`: last event timestamp minus first event timestamp when
  timestamps are parseable; otherwise sum known durations.
- `tokenCount`: sum known token fields when present.
- `toolCalls`: count of `tool_call` events.

## UI Behavior

- `Import` opens a file picker for `.jsonl` and `.json`.
- A successful import replaces the current run and selects the first event.
- A failed import keeps the previous run loaded and shows an error.
- `Export JSONL` downloads the current run as `{runId}.jsonl`.
- `Copy` writes the selected event JSON to the clipboard.
- The replay panel continues to show recorded state up to the selected event.

## Risks

- Schema drift can make adapters vague. Keep the normalized event set small.
- Users may expect replay to re-run the model. UI and README copy should say
  recorded replay.
- Payloads can contain secrets. Traces should be treated as local developer
  artifacts and not committed by default.
