import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import './App.css'
import { mockRun } from './data/mockRun'
import { formatProbeEventJson, parseProbeJsonl, serializeProbeJsonl } from './lib/traceJsonl'
import type { ProbeEvent, ProbeEventType, ProbeRun } from './types/trace'

const eventLabels: Record<ProbeEventType, string> = {
  user_message: 'User',
  model_call: 'Model',
  assistant_delta: 'Stream',
  tool_call: 'Tool call',
  tool_result: 'Tool result',
  approval_request: 'Approval',
  approval_result: 'Approved',
  ui_event: 'UI',
  error: 'Error',
}

const sampleTraces = [
  {
    id: 'release-note',
    label: 'Release note agent',
    path: '/samples/release-note-run.jsonl',
  },
  {
    id: 'ai-sdk-core',
    label: 'AI SDK Core tool loop',
    path: '/samples/ai-sdk-core-mock.jsonl',
  },
] as const

type SampleTrace = (typeof sampleTraces)[number]
type SampleTraceId = SampleTrace['id']

function formatDuration(value?: number) {
  if (typeof value !== 'number') return 'instant'
  if (value < 1000) return `${value} ms`
  return `${(value / 1000).toFixed(1)} s`
}

function formatEventTime(event: ProbeEvent, run: ProbeRun) {
  const startMs = Date.parse(run.startedAt)
  const eventMs = Date.parse(event.timestamp)

  if (!Number.isFinite(startMs) || !Number.isFinite(eventMs) || eventMs < startMs) {
    return event.timestamp
  }

  const elapsedMs = eventMs - startMs
  const seconds = Math.floor(elapsedMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  const milliseconds = String(elapsedMs % 1000).padStart(3, '0')

  return `${String(minutes).padStart(2, '0')}:${remainingSeconds}.${milliseconds}`
}

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [run, setRun] = useState(mockRun)
  const [selectedEventId, setSelectedEventId] = useState(mockRun.events[2].id)
  const [importError, setImportError] = useState<string | undefined>()
  const [activeSampleId, setActiveSampleId] = useState<SampleTraceId | undefined>()
  const [loadingSampleId, setLoadingSampleId] = useState<SampleTraceId | undefined>()
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')
  const selectedEvent = useMemo(
    () => run.events.find((event) => event.id === selectedEventId) ?? run.events[0],
    [run.events, selectedEventId],
  )

  const selectedIndex = run.events.findIndex((event) => event.id === selectedEvent.id)
  const replayEvents = run.events.slice(0, selectedIndex + 1)

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    try {
      const importedRun = parseProbeJsonl(await file.text(), { filename: file.name })

      setRun(importedRun)
      setSelectedEventId(importedRun.events[0].id)
      setActiveSampleId(undefined)
      setImportError(undefined)
      setCopyState('idle')
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed.')
    }
  }

  async function handleLoadSample(sample: SampleTrace) {
    setLoadingSampleId(sample.id)

    try {
      const response = await fetch(sample.path)

      if (!response.ok) {
        throw new Error(`Could not load ${sample.label}.`)
      }

      const sampleRun = parseProbeJsonl(await response.text(), { filename: sample.path })

      setRun(sampleRun)
      setSelectedEventId(sampleRun.events[0].id)
      setActiveSampleId(sample.id)
      setImportError(undefined)
      setCopyState('idle')
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Sample load failed.')
    } finally {
      setLoadingSampleId(undefined)
    }
  }

  function handleExport() {
    const blob = new Blob([serializeProbeJsonl(run)], { type: 'application/x-ndjson;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${run.id}.jsonl`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleCopy() {
    setCopyState('idle')

    try {
      await copyText(formatProbeEventJson(selectedEvent))
      setCopyState('success')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">probe local runtime</p>
          <h1>Agent run replay debugger</h1>
        </div>
        <div className="topbar-actions" aria-label="Run actions">
          <input
            ref={fileInputRef}
            className="file-input"
            type="file"
            accept=".jsonl,.json,application/json,application/x-ndjson"
            onChange={handleImport}
          />
          <button
            type="button"
            className="icon-button"
            title="Import trace"
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </button>
          <button type="button" className="primary-action" onClick={handleExport}>
            Export JSONL
          </button>
        </div>
      </header>

      {importError ? (
        <div className="notice error" role="alert">
          {importError}
        </div>
      ) : null}

      <section className="sample-strip" aria-label="Bundled sample traces">
        <div>
          <p className="eyebrow">Samples</p>
          <strong>{run.id}</strong>
        </div>
        <div className="sample-actions">
          {sampleTraces.map((sample) => (
            <button
              key={sample.id}
              type="button"
              className={sample.id === activeSampleId ? 'sample-button active' : 'sample-button'}
              disabled={Boolean(loadingSampleId)}
              onClick={() => void handleLoadSample(sample)}
            >
              {loadingSampleId === sample.id ? 'Loading' : sample.label}
            </button>
          ))}
        </div>
      </section>

      <section className="summary-grid" aria-label="Run summary">
        <article>
          <span>Run</span>
          <strong>{run.id}</strong>
        </article>
        <article>
          <span>Model</span>
          <strong>{run.model}</strong>
        </article>
        <article>
          <span>Duration</span>
          <strong>{formatDuration(run.totalDurationMs)}</strong>
        </article>
        <article>
          <span>Events</span>
          <strong>{run.events.length}</strong>
        </article>
        <article>
          <span>Tool calls</span>
          <strong>{run.toolCalls}</strong>
        </article>
      </section>

      <section className="workspace">
        <aside className="panel timeline-panel" aria-label="Trace timeline">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Timeline</p>
              <h2>{run.title}</h2>
            </div>
            <span className={`status-pill ${run.status}`}>{run.status}</span>
          </div>

          <ol className="timeline">
            {run.events.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  className={event.id === selectedEvent.id ? 'event-row active' : 'event-row'}
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <span className={`event-dot ${event.status}`} />
                  <span className="event-main">
                    <span className="event-meta">
                      <span>{formatEventTime(event, run)}</span>
                      <span>{eventLabels[event.type]}</span>
                    </span>
                    <strong>{event.title}</strong>
                    <small>{event.summary}</small>
                  </span>
                  <span className="event-duration">{formatDuration(event.durationMs)}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section className="panel replay-panel" aria-label="Replay canvas">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Replay</p>
              <h2>Recorded run state</h2>
            </div>
            <span className="frame-counter">
              {selectedIndex + 1}/{run.events.length}
            </span>
          </div>

          <div className="message-stack">
            {replayEvents.map((event) => (
              <article key={event.id} className={`message-card ${event.source}`}>
                <div>
                  <span>{eventLabels[event.type]}</span>
                  <strong>{event.title}</strong>
                </div>
                <p>{event.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel inspector-panel" aria-label="Event inspector">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Inspector</p>
              <h2>{selectedEvent.id}</h2>
            </div>
            <span className={`status-pill ${selectedEvent.status}`}>{selectedEvent.status}</span>
          </div>

          <dl className="event-facts">
            <div>
              <dt>Type</dt>
              <dd>{selectedEvent.type}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{selectedEvent.source}</dd>
            </div>
            <div>
              <dt>Parent</dt>
              <dd>{selectedEvent.parentId ?? 'root'}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{formatDuration(selectedEvent.durationMs)}</dd>
            </div>
          </dl>

          <div className="payload-block">
            <div className="payload-title">
              <span>Payload</span>
              <div className="copy-actions">
                {copyState !== 'idle' ? (
                  <span className={`copy-state ${copyState}`} role="status">
                    {copyState === 'success' ? 'Copied' : 'Failed'}
                  </span>
                ) : null}
                <button type="button" onClick={handleCopy}>
                  Copy
                </button>
              </div>
            </div>
            <pre>{formatProbeEventJson(selectedEvent)}</pre>
          </div>
        </aside>
      </section>
    </main>
  )
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Fall through for local preview contexts where Clipboard API is blocked.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.append(textarea)
  textarea.select()

  const copied = document.execCommand('copy')
  textarea.remove()

  if (!copied) {
    throw new Error('Copy failed.')
  }
}

export default App
