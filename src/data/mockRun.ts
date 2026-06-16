export type ProbeEventType =
  | 'user_message'
  | 'model_call'
  | 'assistant_delta'
  | 'tool_call'
  | 'tool_result'
  | 'approval_request'
  | 'approval_result'
  | 'ui_event'
  | 'error'

export type ProbeEventStatus = 'pending' | 'running' | 'success' | 'warning' | 'error'

export type ProbeEvent = {
  id: string
  parentId?: string
  time: string
  type: ProbeEventType
  source: 'ui' | 'agent' | 'model' | 'tool' | 'human'
  title: string
  summary: string
  status: ProbeEventStatus
  durationMs?: number
  payload: Record<string, unknown>
}

export type ProbeRun = {
  id: string
  title: string
  status: ProbeEventStatus
  startedAt: string
  model: string
  totalDurationMs: number
  tokenCount: number
  toolCalls: number
  events: ProbeEvent[]
}

export const mockRun: ProbeRun = {
  id: 'run_local_001',
  title: 'Draft a release note from repo changes',
  status: 'success',
  startedAt: '2026-06-16T11:34:19+08:00',
  model: 'gpt-5-codex',
  totalDurationMs: 18940,
  tokenCount: 8420,
  toolCalls: 4,
  events: [
    {
      id: 'evt_001',
      time: '00:00.000',
      type: 'user_message',
      source: 'ui',
      title: 'User prompt submitted',
      summary: 'Ask the agent to inspect recent changes and draft a release note.',
      status: 'success',
      payload: {
        prompt: 'Summarize the last feature branch into a concise release note.',
        route: '/api/agent/release-note',
      },
    },
    {
      id: 'evt_002',
      parentId: 'evt_001',
      time: '00:00.214',
      type: 'model_call',
      source: 'model',
      title: 'Planner model call',
      summary: 'The agent decides it needs git context before writing.',
      status: 'success',
      durationMs: 1640,
      payload: {
        model: 'gpt-5-codex',
        inputTokens: 2190,
        outputTokens: 418,
        decision: 'inspect git diff, then draft',
      },
    },
    {
      id: 'evt_003',
      parentId: 'evt_002',
      time: '00:01.902',
      type: 'tool_call',
      source: 'tool',
      title: 'Tool call: git.diff',
      summary: 'Read the changed files and produce a compact patch summary.',
      status: 'success',
      durationMs: 520,
      payload: {
        tool: 'git.diff',
        args: { range: 'main...HEAD', stat: true },
      },
    },
    {
      id: 'evt_004',
      parentId: 'evt_003',
      time: '00:02.438',
      type: 'tool_result',
      source: 'tool',
      title: 'Tool result received',
      summary: '4 files changed, mostly trace event plumbing and UI polish.',
      status: 'success',
      durationMs: 28,
      payload: {
        filesChanged: 4,
        insertions: 382,
        deletions: 41,
        highlights: ['trace event schema', 'timeline UI', 'export action'],
      },
    },
    {
      id: 'evt_005',
      parentId: 'evt_002',
      time: '00:03.104',
      type: 'assistant_delta',
      source: 'agent',
      title: 'Assistant stream started',
      summary: 'The response begins streaming into the UI.',
      status: 'running',
      payload: {
        text: 'This release introduces a replayable agent trace surface...',
      },
    },
    {
      id: 'evt_006',
      parentId: 'evt_005',
      time: '00:05.720',
      type: 'approval_request',
      source: 'agent',
      title: 'Approval requested',
      summary: 'Agent asks before exporting a local artifact.',
      status: 'warning',
      payload: {
        action: 'write_file',
        target: 'outputs/release-note.md',
        reason: 'User asked for a shareable release note.',
      },
    },
    {
      id: 'evt_007',
      parentId: 'evt_006',
      time: '00:07.066',
      type: 'approval_result',
      source: 'human',
      title: 'Approval granted',
      summary: 'Human approves the file write.',
      status: 'success',
      durationMs: 1346,
      payload: {
        approved: true,
        by: 'local_user',
      },
    },
    {
      id: 'evt_008',
      parentId: 'evt_007',
      time: '00:07.220',
      type: 'tool_call',
      source: 'tool',
      title: 'Tool call: fs.writeFile',
      summary: 'Persist the generated release note.',
      status: 'success',
      durationMs: 76,
      payload: {
        path: 'outputs/release-note.md',
        bytes: 1184,
      },
    },
    {
      id: 'evt_009',
      parentId: 'evt_008',
      time: '00:08.012',
      type: 'ui_event',
      source: 'ui',
      title: 'UI state committed',
      summary: 'The run panel marks the artifact as exported.',
      status: 'success',
      payload: {
        route: '/runs/run_local_001',
        selectedEvent: 'evt_008',
        toast: 'Release note exported',
      },
    },
    {
      id: 'evt_010',
      parentId: 'evt_005',
      time: '00:18.940',
      type: 'assistant_delta',
      source: 'agent',
      title: 'Final answer completed',
      summary: 'The run finishes with a concise summary and output link.',
      status: 'success',
      durationMs: 11874,
      payload: {
        finishReason: 'stop',
        output: 'Release note written and ready for review.',
      },
    },
  ],
}
