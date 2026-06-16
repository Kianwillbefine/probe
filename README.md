# probe

`probe` is a local-first prototype for an agent runtime probe and replay debugger.

The current scaffold is intentionally small:

- React + TypeScript + Vite app
- shared normalized run and event types
- bundled sample trace in `public/samples/release-note-run.jsonl`
- three-pane replay UI: timeline, recorded run state, event inspector
- local JSONL import, export, and event JSON copy
- deterministic AI SDK-shaped trace writer demo
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

The current demo uses an AI SDK-shaped writer without calling a live model, so it
runs without provider credentials. A live integration can record the same
writer events from AI SDK callbacks around `streamText` or `generateText`:

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

The next useful implementation slice is a live AI SDK example that wraps a real
`streamText` call and writes the trace file automatically.
