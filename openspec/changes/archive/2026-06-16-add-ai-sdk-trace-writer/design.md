# Design: Add AI SDK Trace Writer

## Chosen Approach

Create a local writer module that accumulates normalized `ProbeEvent` objects and
serializes them with the existing JSONL helpers. Keep the demo deterministic and
provider-free by feeding AI SDK-shaped lifecycle snapshots into the mapper.

This gives the project a real writer surface without making the first adapter
depend on API keys, network calls, or a package publishing step.

## File Contract

Default writer path:

```text
.probe/runs/{runId}.jsonl
```

Generated files are local artifacts and should be ignored by git.

## Writer API

The core writer owns:

- `runId`
- ordered `ProbeEvent[]`
- monotonically increasing `sequence`
- `record(eventInput)`
- `toRun()`
- `toJsonl()`

The writer does not perform file I/O in browser code. Node examples can write
`toJsonl()` to disk.

## AI SDK Mapping

The AI SDK adapter starts as a set of mapping helpers rather than a wrapper
around `streamText`. This keeps the first slice stable while preserving the
future path to callback wiring.

Mapped events:

- user prompt -> `user_message`
- model start -> `model_call`
- tool invocation -> `tool_call`
- tool output -> `tool_result`
- assistant completion -> `assistant_delta`
- failure -> `error`

Adapter-specific fields stay in `payload`.

## Demo Flow

The demo script:

1. Creates a run id.
2. Records a user prompt.
3. Records a model call.
4. Records one tool call and tool result.
5. Records assistant completion.
6. Writes `.probe/runs/ai-sdk-demo.jsonl`.
7. Re-parses the generated file to confirm it is importable.

## Risks

- AI SDK callback shapes may evolve. Keep the public writer normalized and keep
  AI SDK-specific assumptions inside the adapter helper.
- Users may expect a live model demo. The README should make the no-key demo
  explicit and show where live AI SDK callbacks plug in later.
