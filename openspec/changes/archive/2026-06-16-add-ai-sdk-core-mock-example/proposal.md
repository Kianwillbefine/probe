# Proposal: Add AI SDK Core Mock Example

## Summary

Add a runnable AI SDK Core example that uses `generateText` with the AI SDK
mock language model and writes a Probe JSONL trace from real AI SDK tool
callbacks.

## Motivation

The current writer demo is AI SDK-shaped but does not exercise AI SDK Core. The
next milestone should prove that Probe can sit beside a real agent runtime flow
without requiring provider credentials or network access.

## Scope

- Add the `ai` package as a runtime dependency.
- Add a no-key AI SDK Core mock-provider example.
- Record user prompt, model call, tool call, tool result, and assistant finish
  events into `.probe/runs/ai-sdk-core-mock.jsonl`.
- Include the example in the default demo verification path.
- Document when to use the shaped demo versus the AI SDK Core demo.

## Out of Scope

- No OpenAI, Anthropic, or other real provider credentials.
- No streaming UI.
- No hosted collector.
- No general AI SDK package adapter API beyond the existing writer helper.

## Success Criteria

- Running `pnpm demo:ai-sdk-core` creates a valid Probe JSONL trace.
- The generated trace uses actual AI SDK Core `generateText` tool callbacks.
- `pnpm check` passes and runs both demo generators.
