# Archived Change: Initial Replay Scaffold

## Summary

Created the initial Vite React scaffold for `probe`, including a mock agent run
and a three-pane replay debugger UI.

## Result

- React + TypeScript + Vite app.
- Mock run data in `src/data/mockRun.ts`.
- Timeline, replay panel, and event inspector.
- README describing the local-first replay debugger direction.

## Verification

`pnpm check` is the default verification command after the package manager
migration. The original scaffold was verified with `npm run check` before the
initial repository sync.
