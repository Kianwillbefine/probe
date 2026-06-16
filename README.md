# probe

`probe` is a local-first prototype for an agent runtime probe and replay debugger.

The current scaffold is intentionally small:

- React + TypeScript + Vite app
- mock agent run data in `src/data/mockRun.ts`
- three-pane replay UI: timeline, recorded run state, event inspector
- no backend or SDK adapter yet

## Run

```bash
npm install
npm run dev
```

## Next slice

The next useful implementation slice is a JSONL trace writer:

```text
adapter event -> normalized ProbeEvent -> .probe/runs/{runId}.jsonl -> replay UI
```

Start with one adapter, preferably Vercel AI SDK, before adding Claude Code hooks or MCP proxy support.
