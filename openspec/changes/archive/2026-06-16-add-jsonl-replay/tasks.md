# Tasks: Add JSONL Replay

## 1. Trace Types and Fixture

- [x] 1.1 Move shared run and event types out of `src/data/mockRun.ts`.
- [x] 1.2 Add JSONL parse and serialize helpers.
- [x] 1.3 Add a bundled sample JSONL trace based on the current mock run.
- [x] 1.4 Keep the existing mock run working through the new shared types.

## 2. Browser Import

- [x] 2.1 Add hidden file input or equivalent import control.
- [x] 2.2 Parse selected `.jsonl` files in the browser.
- [x] 2.3 Replace the current run after a successful import.
- [x] 2.4 Keep the previous run loaded when import fails.
- [x] 2.5 Show line-numbered parse errors.

## 3. Browser Export and Copy

- [x] 3.1 Serialize the current run to JSONL.
- [x] 3.2 Download the current run as `{runId}.jsonl`.
- [x] 3.3 Copy the selected event JSON from the inspector.
- [x] 3.4 Show a small success/failure state for copy.

## 4. Verification

- [x] 4.1 Run `pnpm check`.
- [x] 4.2 Manually import the bundled sample JSONL.
- [x] 4.3 Export JSONL and re-import it.
- [x] 4.4 Confirm the re-imported run has the same event count.
- [x] 4.5 Confirm invalid JSONL shows a line-numbered error.
