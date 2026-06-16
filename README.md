# probe

`probe` is a local-first prototype for an agent runtime probe and replay debugger.

The current scaffold is intentionally small:

- React + TypeScript + Vite app
- shared normalized run and event types
- bundled sample trace in `public/samples/release-note-run.jsonl`
- three-pane replay UI: timeline, recorded run state, event inspector
- local JSONL import, export, and event JSON copy
- no backend or SDK adapter yet

## Run

```bash
pnpm install
pnpm dev
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

## Next slice

The next useful implementation slice is a trace writer adapter:

```text
Vercel AI SDK stream/tool events -> normalized ProbeEvent JSONL
```

Start with one adapter, preferably Vercel AI SDK, before adding Claude Code hooks or MCP proxy support.
