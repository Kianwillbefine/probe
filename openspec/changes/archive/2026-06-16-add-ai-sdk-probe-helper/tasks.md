# Tasks: Add AI SDK Probe Helper

## 1. Specification

- [x] 1.1 Add proposal, design, and task list for the helper slice.
- [x] 1.2 Add a trace writer spec delta for AI SDK probe helper behavior.

## 2. Helper API

- [x] 2.1 Add `createAiSdkProbe`.
- [x] 2.2 Expose AI SDK Core-compatible callback options.
- [x] 2.3 Preserve existing `AiSdkTraceWriter` behavior.

## 3. Demo

- [x] 3.1 Refactor AI SDK Core mock demo to use the helper.
- [x] 3.2 Keep generated JSONL parseable by the replay UI parser.

## 4. Documentation

- [x] 4.1 Document the helper in README.
- [x] 4.2 Merge the accepted requirement into the trace writer spec.

## 5. Verification

- [x] 5.1 Run `pnpm demo:ai-sdk-core`.
- [x] 5.2 Run `pnpm check`.
