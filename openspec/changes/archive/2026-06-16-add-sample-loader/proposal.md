# Proposal: Add Sample Trace Loader

## Summary

Add first-run sample trace controls so users can load realistic bundled runs
from the UI without generating or importing JSONL manually.

## Motivation

The replay debugger already supports JSONL import and demo generation, but a new
user still needs to run commands and browse to a hidden `.probe/` path before
seeing the core value. A one-click sample loader makes the product explain
itself in the browser.

## Scope

- Add a bundled AI SDK Core mock sample JSONL file under `public/samples/`.
- Add sample trace metadata and UI controls for loading bundled samples.
- Keep manual JSONL import/export unchanged.
- Document the fastest path for trying the project.

## Out of Scope

- No hosted sample gallery.
- No persisted user run library.
- No automatic loading from `.probe/runs`.
- No backend, accounts, or cloud sync.

## Success Criteria

- The user can load at least two bundled samples from the UI.
- Loading a sample replaces the current run, selects the first event, and clears
  stale import/copy state.
- Sample load errors are shown clearly without losing the currently loaded run.
- `pnpm check` passes.
