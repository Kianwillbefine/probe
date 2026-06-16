# Proposal: Add AI SDK Probe Helper

## Summary

Add a small AI SDK helper that creates Probe-compatible callbacks for AI SDK
Core runs and exposes `toJsonl()` for writing replayable traces.

## Motivation

The current AI SDK Core demo proves Probe can record real tool lifecycle
callbacks, but users still need to copy callback glue into every `generateText`
call. A helper turns the demo into a practical integration shape while keeping
the project local-first and package-free.

## Scope

- Add `createAiSdkProbe` in the AI SDK adapter module.
- Record prompt/model start, tool call start, tool call finish, final assistant
  output, and caught errors through the existing writer.
- Expose callback objects compatible with AI SDK Core `generateText` options.
- Refactor the AI SDK Core mock example to use the helper.
- Document the helper in README.

## Out of Scope

- No npm package publishing.
- No runtime wrapping of `generateText` or `streamText`.
- No real provider credential flow.
- No broad LangChain/LlamaIndex adapter matrix.

## Success Criteria

- The AI SDK Core mock demo uses `createAiSdkProbe`.
- Running `pnpm demo:ai-sdk-core` still writes a valid JSONL trace.
- `pnpm check` passes.
