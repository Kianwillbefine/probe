# Project: probe

`probe` is a local-first agent runtime probe and replay debugger.

The product goal is to make one agent run feel debuggable in the same way a
network request or browser interaction feels debuggable in DevTools: ordered,
inspectable, shareable, and clear about what changed state.

## Principles

- Keep changes scoped to the agent probe/replay debugger.
- Prefer small, runnable slices over speculative framework work.
- Record and replay events at boundaries the developer controls.
- Replay recorded runs; do not re-execute models.
- Do not claim access to hidden model reasoning, private ChatGPT internals, or
  Claude Code internals that are not exposed through public hooks or telemetry.
- Use `pnpm check` as the default verification command before handoff.

## MVP Shape

The first public MVP is a local JSONL agent-run replay debugger:

- Import a JSONL trace.
- Show the run as a timeline, replay view, and event inspector.
- Copy event payloads.
- Export the currently loaded run back to JSONL.
- Include one realistic demo trace.

## Non-Goals

- No hosted backend, accounts, cloud sync, billing, or multi-user collaboration.
- No attempt to trace arbitrary ChatGPT web sessions.
- No attempt to expose hidden chain-of-thought or model-private routing.
- No full Langfuse/OpenTelemetry replacement.
- No broad adapter matrix before the JSONL replay experience works.
- No speculative plugin marketplace, browser extension, or Electron shell.

## References

- Vercel AI SDK `streamText`: https://ai-sdk.dev/docs/reference/ai-sdk-core/stream-text
- Vercel AI SDK tools: https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
- Vercel AI SDK human-in-the-loop: https://ai-sdk.dev/cookbook/next/human-in-the-loop
- Vercel AI SDK telemetry: https://ai-sdk.dev/docs/ai-sdk-core/telemetry
- OpenAI Agents SDK tracing: https://openai.github.io/openai-agents-js/guides/tracing/
