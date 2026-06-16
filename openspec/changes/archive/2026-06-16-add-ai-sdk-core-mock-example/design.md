# Design: Add AI SDK Core Mock Example

## Chosen Approach

Use AI SDK Core's `generateText` and `MockLanguageModelV3` from `ai/test`.
The mock model returns a deterministic two-step flow:

1. The first model response asks to call `getWeather`.
2. AI SDK Core executes the local tool and fires tool lifecycle callbacks.
3. The second model response returns the final assistant text.

The Probe writer records from those lifecycle points while the model remains
local and deterministic.

## Why Mock Provider First

This project is still a local-first replay debugger MVP. A mock-provider example
proves the runtime integration shape without asking users for API keys, spending
tokens, or depending on external availability.

## Trace Contract

The example writes:

```text
.probe/runs/ai-sdk-core-mock.jsonl
```

The output must be parseable by the existing JSONL parser and importable in the
replay UI.

## Event Mapping

- Prompt submission -> `recordUserPrompt`
- `generateText` call start -> `recordModelCall`
- `experimental_onToolCallStart` -> `recordToolCall`
- `experimental_onToolCallFinish` -> `recordToolResult`
- `onFinish` -> `recordAssistantFinish`
- caught failure -> `recordError`

## Notes

`MockLanguageModelV3` is used through a `doGenerate` function queue rather than
its array shortcut so the first generated response is deterministic.
