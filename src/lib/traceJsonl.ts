import {
  probeEventSources,
  probeEventStatuses,
  probeEventTypes,
  type ProbeEvent,
  type ProbeEventSource,
  type ProbeEventStatus,
  type ProbeEventType,
  type ProbeRun,
} from '../types/trace'

type ParsedEvent = {
  event: ProbeEvent
  line: number
  order: number
}

const eventTypeSet = new Set<string>(probeEventTypes)
const eventStatusSet = new Set<string>(probeEventStatuses)
const eventSourceSet = new Set<string>(probeEventSources)

const statusRank: Record<ProbeEventStatus, number> = {
  success: 0,
  pending: 1,
  running: 2,
  warning: 3,
  error: 4,
}

export class TraceJsonlParseError extends Error {
  line?: number

  constructor(message: string, line?: number) {
    super(line ? `Line ${line}: ${message}` : message)
    this.name = 'TraceJsonlParseError'
    this.line = line
  }
}

export function parseProbeJsonl(input: string, options: { filename?: string } = {}): ProbeRun {
  const parsedEvents: ParsedEvent[] = []
  let runId: string | undefined

  input.split(/\r?\n/).forEach((rawLine, index) => {
    const line = index + 1
    const trimmed = rawLine.trim()

    if (!trimmed) return

    let value: unknown

    try {
      value = JSON.parse(trimmed)
    } catch {
      throw new TraceJsonlParseError('Invalid JSON.', line)
    }

    if (!isRecord(value)) {
      throw new TraceJsonlParseError('Expected a JSON object.', line)
    }

    const event = readProbeEvent(value, line)

    if (runId && event.runId !== runId) {
      throw new TraceJsonlParseError(`Expected runId "${runId}" but received "${event.runId}".`, line)
    }

    runId = event.runId
    parsedEvents.push({ event, line, order: parsedEvents.length })
  })

  if (parsedEvents.length === 0) {
    throw new TraceJsonlParseError('No events found.')
  }

  const events = parsedEvents
    .toSorted((left, right) => {
      const leftOrder = left.event.sequence ?? left.order
      const rightOrder = right.event.sequence ?? right.order

      return leftOrder - rightOrder || left.order - right.order
    })
    .map(({ event }) => event)

  return deriveProbeRun(events, options.filename)
}

export function serializeProbeJsonl(run: ProbeRun): string {
  return `${run.events.map((event) => JSON.stringify(toJsonlEvent(event))).join('\n')}\n`
}

export function formatProbeEventJson(event: ProbeEvent): string {
  return JSON.stringify(toJsonlEvent(event), null, 2)
}

function readProbeEvent(record: Record<string, unknown>, line: number): ProbeEvent {
  const runId = readString(record, 'runId', line)
  const id = readString(record, 'id', line)
  const timestamp = readString(record, 'timestamp', line)
  const type = readEventType(record, line)
  const source = readSource(record, line)
  const title = readString(record, 'title', line)
  const summary = readString(record, 'summary', line)
  const status = readStatus(record, line)
  const payload = readPayload(record, line)

  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new TraceJsonlParseError('Field "timestamp" must be a valid ISO 8601 timestamp.', line)
  }

  return {
    runId,
    id,
    parentId: readOptionalString(record, 'parentId', line),
    timestamp,
    type,
    source,
    title,
    summary,
    status,
    durationMs: readOptionalNumber(record, 'durationMs', line),
    sequence: readOptionalNumber(record, 'sequence', line),
    cost: readOptionalRecord(record, 'cost', line),
    tokens: readOptionalRecord(record, 'tokens', line),
    payload,
  }
}

function deriveProbeRun(events: ProbeEvent[], filename?: string): ProbeRun {
  const firstEvent = events[0]
  const lastEvent = events.at(-1) ?? firstEvent
  const startedMs = Date.parse(firstEvent.timestamp)
  const endedMs = Date.parse(lastEvent.timestamp)
  const totalDurationMs =
    Number.isFinite(startedMs) && Number.isFinite(endedMs) && endedMs >= startedMs
      ? endedMs - startedMs
      : events.reduce((total, event) => total + (event.durationMs ?? 0), 0)
  const modelEvent = events.find((event) => event.type === 'model_call')
  const model = typeof modelEvent?.payload.model === 'string' ? modelEvent.payload.model : 'unknown'
  const importedTitle = filename?.replace(/\.(jsonl|json)$/i, '')
  const title = events.find((event) => event.type === 'user_message')?.title ?? importedTitle ?? firstEvent.runId

  return {
    id: firstEvent.runId,
    title,
    status: events.reduce(
      (worst, event) => (statusRank[event.status] > statusRank[worst] ? event.status : worst),
      'success' as ProbeEventStatus,
    ),
    startedAt: firstEvent.timestamp,
    model,
    totalDurationMs,
    tokenCount: events.reduce((total, event) => total + sumTokenFields(event), 0),
    toolCalls: events.filter((event) => event.type === 'tool_call').length,
    events,
  }
}

function toJsonlEvent(event: ProbeEvent): Record<string, unknown> {
  const record: Record<string, unknown> = {
    runId: event.runId,
    id: event.id,
    timestamp: event.timestamp,
    type: event.type,
    source: event.source,
    title: event.title,
    summary: event.summary,
    status: event.status,
    payload: event.payload,
  }

  if (event.parentId) record.parentId = event.parentId
  if (typeof event.durationMs === 'number') record.durationMs = event.durationMs
  if (typeof event.sequence === 'number') record.sequence = event.sequence
  if (event.cost) record.cost = event.cost
  if (event.tokens) record.tokens = event.tokens

  return record
}

function sumTokenFields(event: ProbeEvent): number {
  return sumNumericTokenValues(event.tokens) + sumNumericTokenValues(event.payload)
}

function sumNumericTokenValues(record?: Record<string, unknown>): number {
  if (!record) return 0

  return Object.entries(record).reduce((total, [key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value) && /tokens?/i.test(key)) {
      return total + value
    }

    return total
  }, 0)
}

function readEventType(record: Record<string, unknown>, line: number): ProbeEventType {
  const value = readString(record, 'type', line)

  if (!eventTypeSet.has(value)) {
    throw new TraceJsonlParseError(`Unsupported event type "${value}".`, line)
  }

  return value as ProbeEventType
}

function readStatus(record: Record<string, unknown>, line: number): ProbeEventStatus {
  const value = readString(record, 'status', line)

  if (!eventStatusSet.has(value)) {
    throw new TraceJsonlParseError(`Unsupported status "${value}".`, line)
  }

  return value as ProbeEventStatus
}

function readSource(record: Record<string, unknown>, line: number): ProbeEventSource {
  const value = readString(record, 'source', line)

  if (!eventSourceSet.has(value)) {
    throw new TraceJsonlParseError(`Unsupported source "${value}".`, line)
  }

  return value as ProbeEventSource
}

function readPayload(record: Record<string, unknown>, line: number): Record<string, unknown> {
  const payload = record.payload

  if (!isRecord(payload)) {
    throw new TraceJsonlParseError('Field "payload" must be a JSON object.', line)
  }

  return payload
}

function readString(record: Record<string, unknown>, field: string, line: number): string {
  const value = record[field]

  if (typeof value !== 'string' || value.trim() === '') {
    throw new TraceJsonlParseError(`Field "${field}" must be a non-empty string.`, line)
  }

  return value
}

function readOptionalString(record: Record<string, unknown>, field: string, line: number): string | undefined {
  const value = record[field]

  if (value === undefined) return undefined

  if (typeof value !== 'string' || value.trim() === '') {
    throw new TraceJsonlParseError(`Field "${field}" must be a non-empty string when provided.`, line)
  }

  return value
}

function readOptionalNumber(record: Record<string, unknown>, field: string, line: number): number | undefined {
  const value = record[field]

  if (value === undefined) return undefined

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TraceJsonlParseError(`Field "${field}" must be a finite number when provided.`, line)
  }

  return value
}

function readOptionalRecord(
  record: Record<string, unknown>,
  field: string,
  line: number,
): Record<string, unknown> | undefined {
  const value = record[field]

  if (value === undefined) return undefined

  if (!isRecord(value)) {
    throw new TraceJsonlParseError(`Field "${field}" must be a JSON object when provided.`, line)
  }

  return value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
