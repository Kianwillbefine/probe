# Design: Add AI SDK Probe Helper

## Chosen Approach

Build a thin helper on top of `AiSdkTraceWriter`:

```text
createAiSdkProbe(options) -> writer + callbacks + toJsonl()
```

The helper records the user prompt and model call immediately, then provides AI
SDK Core callbacks for tool and finish events.

## API Shape

```ts
const probe = createAiSdkProbe({
  runId,
  model,
  prompt,
  title,
  startedAt,
})

await generateText({
  model,
  prompt,
  tools,
  ...probe.callbacks,
})

const jsonl = probe.toJsonl()
```

## Callback Mapping

- `experimental_onToolCallStart` -> `recordToolCall`
- `experimental_onToolCallFinish` -> `recordToolResult` or `recordError`
- `onFinish` -> `recordAssistantFinish`

## Timestamp Handling

The helper accepts optional fixed timestamps for deterministic demos. If omitted,
the writer falls back to current time through `ProbeTraceWriter`.

## Non-Goals

The helper does not call AI SDK APIs itself. Users remain in control of their
`generateText` or `streamText` call and can compose Probe callbacks with their
own app logic later.
