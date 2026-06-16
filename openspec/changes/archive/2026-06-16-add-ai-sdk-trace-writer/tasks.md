# Tasks: Add AI SDK Trace Writer

## 1. Specification

- [x] 1.1 Add proposal, design, and task list for the AI SDK writer slice.
- [x] 1.2 Add a spec delta for trace writer behavior.

## 2. Writer API

- [x] 2.1 Add a reusable trace writer module.
- [x] 2.2 Keep writer output compatible with the existing JSONL parser.
- [x] 2.3 Ensure generated events have stable run ids, timestamps, and sequence.

## 3. AI SDK Demo

- [x] 3.1 Add AI SDK-shaped mapping helpers.
- [x] 3.2 Add a deterministic demo script that writes `.probe/runs/ai-sdk-demo.jsonl`.
- [x] 3.3 Add a package script for running the demo.
- [x] 3.4 Ignore generated `.probe/` output.

## 4. Documentation

- [x] 4.1 Document the demo command.
- [x] 4.2 Document how to import the generated JSONL into the UI.

## 5. Verification

- [x] 5.1 Run the demo script.
- [x] 5.2 Confirm the generated JSONL re-parses successfully.
- [x] 5.3 Run `pnpm check`.
