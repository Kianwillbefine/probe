import { serializeProbeJsonl } from './traceJsonl'
import type { ProbeEvent, ProbeEventSource, ProbeEventStatus, ProbeEventType, ProbeRun } from '../types/trace'

export type ProbeEventInput = {
  id?: string
  parentId?: string
  timestamp?: string
  type: ProbeEventType
  source: ProbeEventSource
  title: string
  summary: string
  status?: ProbeEventStatus
  durationMs?: number
  cost?: Record<string, unknown>
  tokens?: Record<string, unknown>
  payload?: Record<string, unknown>
}

export type ProbeTraceWriterOptions = {
  runId: string
  title?: string
  startedAt?: string
  model?: string
}

export class ProbeTraceWriter {
  private readonly runId: string
  private readonly title?: string
  private readonly model?: string
  private readonly events: ProbeEvent[] = []
  private nextSequence = 1

  constructor(options: ProbeTraceWriterOptions) {
    this.runId = options.runId
    this.title = options.title
    this.model = options.model

    if (options.startedAt) {
      this.record({
        id: 'run_started',
        timestamp: options.startedAt,
        type: 'ui_event',
        source: 'system',
        title: 'Run started',
        summary: 'Probe trace writer started recording this run.',
        status: 'success',
        payload: { runId: options.runId },
      })
    }
  }

  record(input: ProbeEventInput): ProbeEvent {
    const event: ProbeEvent = {
      runId: this.runId,
      id: input.id ?? `evt_${String(this.nextSequence).padStart(3, '0')}`,
      parentId: input.parentId,
      timestamp: input.timestamp ?? new Date().toISOString(),
      type: input.type,
      source: input.source,
      title: input.title,
      summary: input.summary,
      status: input.status ?? 'success',
      durationMs: input.durationMs,
      sequence: this.nextSequence,
      cost: input.cost,
      tokens: input.tokens,
      payload: input.payload ?? {},
    }

    this.events.push(event)
    this.nextSequence += 1

    return event
  }

  toRun(): ProbeRun {
    const firstEvent = this.events[0]
    const lastEvent = this.events.at(-1) ?? firstEvent
    const startedAt = firstEvent?.timestamp ?? new Date().toISOString()
    const startedMs = Date.parse(firstEvent?.timestamp ?? '')
    const endedMs = Date.parse(lastEvent?.timestamp ?? '')
    const totalDurationMs =
      Number.isFinite(startedMs) && Number.isFinite(endedMs) ? Math.max(0, endedMs - startedMs) : 0

    return {
      id: this.runId,
      title: this.title ?? firstEvent?.title ?? this.runId,
      status: this.events.some((event) => event.status === 'error') ? 'error' : 'success',
      startedAt,
      model: this.model ?? readModel(this.events) ?? 'unknown',
      totalDurationMs,
      tokenCount: this.events.reduce((total, event) => total + sumTokenPayload(event), 0),
      toolCalls: this.events.filter((event) => event.type === 'tool_call').length,
      events: [...this.events],
    }
  }

  toJsonl(): string {
    return serializeProbeJsonl(this.toRun())
  }
}

function readModel(events: ProbeEvent[]) {
  const modelEvent = events.find((event) => event.type === 'model_call')

  return typeof modelEvent?.payload.model === 'string' ? modelEvent.payload.model : undefined
}

function sumTokenPayload(event: ProbeEvent) {
  return sumTokens(event.payload) + sumTokens(event.tokens)
}

function sumTokens(record?: Record<string, unknown>) {
  if (!record) return 0

  return Object.entries(record).reduce((total, [key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value) && /tokens?/i.test(key)) {
      return total + value
    }

    return total
  }, 0)
}
