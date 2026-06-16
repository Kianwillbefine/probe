# Design: Add Sample Trace Loader

## Chosen Approach

Keep samples as static JSONL assets in `public/samples/` and load them with
`fetch` from the browser. This matches the local-first MVP and avoids a backend
or filesystem bridge.

## UI Placement

Add a compact sample strip between the topbar and run summary:

- left side: short label and currently loaded run id
- right side: one button per bundled sample

This keeps import/export in the topbar focused on user files while sample
loading remains discoverable.

## Data Flow

```text
sample button -> fetch public JSONL -> parseProbeJsonl -> setRun -> setSelectedEventId(first event)
```

The UI must not replace the current run until parsing succeeds.

## Sample Sources

- `public/samples/release-note-run.jsonl`
- `public/samples/ai-sdk-core-mock.jsonl`

The AI SDK Core mock sample is generated from the same scenario as
`pnpm demo:ai-sdk-core`, then committed as a public static sample.

## Failure Handling

If loading fails, preserve the current run and show a visible notice. Clear stale
copy state on successful load.
