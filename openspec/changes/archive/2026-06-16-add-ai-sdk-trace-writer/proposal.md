# Proposal: Add AI SDK Trace Writer

## Summary

Add a small Vercel AI SDK-oriented trace writer that turns agent lifecycle
events into Probe JSONL files. Include a runnable demo that generates a trace
without requiring model provider credentials.

## Motivation

The replay UI can inspect JSONL traces, but new users still need a realistic way
to produce one. A writer closes the loop from agent runtime to local replay and
makes the project easier to try from a fresh clone.

## Scope

- Add a reusable writer for normalized Probe events.
- Add AI SDK event mapping helpers for user prompts, model calls, tool calls,
  tool results, assistant output, and errors.
- Add a local demo script that writes `.probe/runs/ai-sdk-demo.jsonl`.
- Document the shortest path from demo generation to replay UI import.

## Out of Scope

- No live model provider integration or API key flow.
- No npm package publishing.
- No hosted collector or backend service.
- No broad adapter matrix.
- No automatic import from the UI.

## Success Criteria

- Running the demo creates a valid `.probe/runs/ai-sdk-demo.jsonl` file.
- The generated trace imports into the existing replay UI.
- The trace includes user, model, tool call, tool result, and assistant output
  events.
- `pnpm check` passes.
