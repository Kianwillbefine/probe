import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AiSdkTraceWriter } from '../../src/adapters/aiSdkTraceWriter'
import { parseProbeJsonl } from '../../src/lib/traceJsonl'

const outputPath = '.probe/runs/ai-sdk-demo.jsonl'

const trace = new AiSdkTraceWriter({
  runId: 'ai_sdk_demo_001',
  model: 'gpt-4.1-mini',
  title: 'AI SDK weather tool demo',
  startedAt: '2026-06-16T12:30:00.000+08:00',
})

trace.recordUserPrompt('Check the weather in Hangzhou and draft a short travel note.', '2026-06-16T12:30:00.120+08:00')
trace.recordModelCall({
  model: 'gpt-4.1-mini',
  prompt: 'Check the weather in Hangzhou and draft a short travel note.',
  timestamp: '2026-06-16T12:30:00.240+08:00',
})
trace.recordToolCall({
  id: 'tool_call_weather',
  timestamp: '2026-06-16T12:30:01.080+08:00',
  name: 'getWeather',
  args: { city: 'Hangzhou', unit: 'celsius' },
})
trace.recordToolResult({
  toolCallId: 'tool_call_weather',
  timestamp: '2026-06-16T12:30:01.122+08:00',
  name: 'getWeather',
  durationMs: 42,
  result: { city: 'Hangzhou', condition: 'light rain', temperature: 24 },
})
trace.recordAssistantFinish({
  timestamp: '2026-06-16T12:30:02.400+08:00',
  text: 'Hangzhou is mild with light rain today. Bring a compact umbrella and plan indoor stops near West Lake.',
  finishReason: 'stop',
  usage: { inputTokens: 316, outputTokens: 42, totalTokens: 358 },
})

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, trace.toJsonl())

const generated = await readFile(outputPath, 'utf8')
const run = parseProbeJsonl(generated, { filename: fileURLToPath(import.meta.url) })

console.log(`Wrote ${outputPath}`)
console.log(`Run: ${run.id}`)
console.log(`Events: ${run.events.length}`)
