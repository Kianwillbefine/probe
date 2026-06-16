# Change: Add JSONL Replay

## Motivation

The current app demonstrates the replay debugger using hard-coded mock data.
The next useful slice is to make the product work with a real local artifact:
one JSONL trace file that can be imported, inspected, exported, and shared.

This proves the core product loop before adding a framework adapter or backend.

## Scope

- Define shared trace types for normalized probe events and runs.
- Parse JSONL trace files in the browser.
- Serialize the current run back to JSONL.
- Add a bundled sample JSONL trace based on the current mock run.
- Wire `Import` to load a local JSONL file.
- Wire `Export JSONL` to download the current run.
- Wire `Copy` to copy the selected event payload.
- Show clear import errors for invalid JSONL lines.

## Out of Scope

- No backend server.
- No database.
- No Vercel AI SDK adapter yet.
- No Claude Code or ChatGPT adapter.
- No re-executing model calls during replay.
- No secret redaction system beyond documenting local trace risk.

## Success Criteria

- A developer can import a JSONL trace and inspect the run.
- Exported JSONL can be imported again.
- Invalid JSONL reports a readable line-numbered error.
- The bundled sample trace communicates the primary demo story.
- `pnpm check` passes.
