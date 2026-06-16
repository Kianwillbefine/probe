export const probeEventTypes = [
  'user_message',
  'model_call',
  'assistant_delta',
  'tool_call',
  'tool_result',
  'approval_request',
  'approval_result',
  'ui_event',
  'error',
] as const

export const probeEventStatuses = ['pending', 'running', 'success', 'warning', 'error'] as const

export const probeEventSources = ['ui', 'agent', 'model', 'tool', 'human', 'system'] as const

export type ProbeEventType = (typeof probeEventTypes)[number]

export type ProbeEventStatus = (typeof probeEventStatuses)[number]

export type ProbeEventSource = (typeof probeEventSources)[number]

export type ProbeEvent = {
  runId: string
  id: string
  parentId?: string
  timestamp: string
  type: ProbeEventType
  source: ProbeEventSource
  title: string
  summary: string
  status: ProbeEventStatus
  durationMs?: number
  sequence?: number
  cost?: Record<string, unknown>
  tokens?: Record<string, unknown>
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
