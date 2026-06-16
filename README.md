# probe

`probe` is a local-first prototype for an agent runtime probe and replay debugger.

The current scaffold is intentionally small:

- React + TypeScript + Vite app
- shared normalized run and event types
- bundled sample trace in `public/samples/release-note-run.jsonl`
- three-pane replay UI: timeline, recorded run state, event inspector
- local JSONL import, export, and event JSON copy
- deterministic AI SDK-shaped trace writer demo
- no-key AI SDK Core mock-provider trace writer demo
- no backend or hosted collector yet

## Run

```bash
pnpm install
pnpm dev
```

## Quick demo

Generate a local trace:

```bash
pnpm demo:ai-sdk
```

Then start the UI and import the generated file:

```text
.probe/runs/ai-sdk-demo.jsonl
```

Generate a trace from a real AI SDK Core `generateText` tool loop without API
keys:

```bash
pnpm demo:ai-sdk-core
```

Then import:

```text
.probe/runs/ai-sdk-core-mock.jsonl
```

## Trace shape

The replay UI reads one JSON object per line:

```text
adapter event -> normalized ProbeEvent -> .probe/runs/{runId}.jsonl -> replay UI
```

You can try the bundled sample trace at:

```text
public/samples/release-note-run.jsonl
```

## AI SDK writer shape

The shaped demo feeds deterministic lifecycle snapshots into the writer. The AI
SDK Core mock demo uses `generateText`, `MockLanguageModelV3`, and real tool
callbacks, while still running without provider credentials. A live integration
can record the same writer events from callbacks around `streamText` or
`generateText`:

```ts
import { AiSdkTraceWriter } from './src/adapters/aiSdkTraceWriter'

const trace = new AiSdkTraceWriter({
  runId: crypto.randomUUID(),
  model: 'gpt-4.1-mini',
})

trace.recordUserPrompt(prompt)
trace.recordModelCall({ model: 'gpt-4.1-mini', prompt })

// In AI SDK tool callbacks:
trace.recordToolCall({ name: 'getWeather', args: { city: 'Hangzhou' } })
trace.recordToolResult({ name: 'getWeather', result: weather })

// In the finish callback:
trace.recordAssistantFinish({ text, finishReason, usage })

const jsonl = trace.toJsonl()
```

## Next slice

The next useful implementation slice is a tiny package-facing adapter API so a
real AI SDK app can create a Probe trace with less custom callback glue.
