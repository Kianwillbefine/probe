import { useMemo, useState } from 'react'
import './App.css'
import { mockRun, type ProbeEvent, type ProbeEventType } from './data/mockRun'

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

function formatDuration(value?: number) {
  if (typeof value !== 'number') return 'instant'
  if (value < 1000) return `${value} ms`
  return `${(value / 1000).toFixed(1)} s`
}

function toPrettyJson(event: ProbeEvent) {
  return JSON.stringify(
    {
      id: event.id,
      parentId: event.parentId,
      type: event.type,
      source: event.source,
      status: event.status,
      durationMs: event.durationMs,
      payload: event.payload,
    },
    null,
    2,
  )
}

function App() {
  const [selectedEventId, setSelectedEventId] = useState(mockRun.events[2].id)
  const selectedEvent = useMemo(
    () => mockRun.events.find((event) => event.id === selectedEventId) ?? mockRun.events[0],
    [selectedEventId],
  )

  const selectedIndex = mockRun.events.findIndex((event) => event.id === selectedEvent.id)
  const replayEvents = mockRun.events.slice(0, selectedIndex + 1)

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">probe local runtime</p>
          <h1>Agent run replay debugger</h1>
        </div>
        <div className="topbar-actions" aria-label="Run actions">
          <button type="button" className="icon-button" title="Import trace">
            Import
          </button>
          <button type="button" className="primary-action">
            Export JSONL
          </button>
        </div>
      </header>

      <section className="summary-grid" aria-label="Run summary">
        <article>
          <span>Run</span>
          <strong>{mockRun.id}</strong>
        </article>
        <article>
          <span>Model</span>
          <strong>{mockRun.model}</strong>
        </article>
        <article>
          <span>Duration</span>
          <strong>{formatDuration(mockRun.totalDurationMs)}</strong>
        </article>
        <article>
          <span>Events</span>
          <strong>{mockRun.events.length}</strong>
        </article>
        <article>
          <span>Tool calls</span>
          <strong>{mockRun.toolCalls}</strong>
        </article>
      </section>

      <section className="workspace">
        <aside className="panel timeline-panel" aria-label="Trace timeline">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Timeline</p>
              <h2>{mockRun.title}</h2>
            </div>
            <span className={`status-pill ${mockRun.status}`}>{mockRun.status}</span>
          </div>

          <ol className="timeline">
            {mockRun.events.map((event) => (
              <li key={event.id}>
                <button
                  type="button"
                  className={event.id === selectedEvent.id ? 'event-row active' : 'event-row'}
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <span className={`event-dot ${event.status}`} />
                  <span className="event-main">
                    <span className="event-meta">
                      <span>{event.time}</span>
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
              {selectedIndex + 1}/{mockRun.events.length}
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
              <button type="button">Copy</button>
            </div>
            <pre>{toPrettyJson(selectedEvent)}</pre>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
