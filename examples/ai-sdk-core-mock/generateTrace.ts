import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateText, jsonSchema, stepCountIs, tool } from 'ai'
import { MockLanguageModelV3 } from 'ai/test'
import { createAiSdkProbe } from '../../src/adapters/aiSdkTraceWriter'
import { parseProbeJsonl } from '../../src/lib/traceJsonl'

const outputPath = '.probe/runs/ai-sdk-core-mock.jsonl'
const runId = 'ai_sdk_core_mock_001'
const modelId = 'probe-ai-sdk-core-mock'
const prompt = 'Check the weather in Hangzhou and draft a short travel note.'

type MockUsageInput = {
  inputTokens: {
    total: number
    noCache: number
    cacheRead: number
    cacheWrite: number
  }
  outputTokens: {
    total: number
    text: number
    reasoning: number
  }
}

const createMockUsage = (inputTokens: number, outputTokens: number): MockUsageInput => ({
  inputTokens: {
    total: inputTokens,
    noCache: inputTokens,
    cacheRead: 0,
    cacheWrite: 0,
  },
  outputTokens: {
    total: outputTokens,
    text: outputTokens,
    reasoning: 0,
  },
})

const responses = [
  {
    content: [
      {
        type: 'tool-call',
        toolCallId: 'tool_call_weather',
        toolName: 'getWeather',
        input: JSON.stringify({ city: 'Hangzhou', unit: 'celsius' }),
      },
    ],
    finishReason: { unified: 'tool-calls', raw: 'tool_calls' },
    usage: createMockUsage(72, 16),
    response: {
      id: 'resp_weather_tool_call',
      timestamp: new Date('2026-06-16T04:30:01.000Z'),
      modelId,
    },
  },
  {
    content: [
      {
        type: 'text',
        text: 'Hangzhou is mild with light rain today. Bring a compact umbrella and keep a flexible West Lake route.',
      },
    ],
    finishReason: { unified: 'stop', raw: 'stop' },
    usage: createMockUsage(95, 24),
    response: {
      id: 'resp_final',
      timestamp: new Date('2026-06-16T04:30:02.000Z'),
      modelId,
    },
  },
] as const

let responseIndex = 0

const model = new MockLanguageModelV3({
  provider: 'probe-mock',
  modelId,
  doGenerate: async () => responses[responseIndex++] ?? responses.at(-1),
})

const probe = createAiSdkProbe({
  runId,
  model: modelId,
  prompt,
  includeToolDuration: false,
  title: 'AI SDK Core mock weather tool demo',
  startedAt: '2026-06-16T12:30:00.000+08:00',
  timestamps: {
    userPrompt: '2026-06-16T12:30:00.120+08:00',
    modelCall: '2026-06-16T12:30:00.240+08:00',
    toolCall: '2026-06-16T12:30:01.080+08:00',
    toolResult: '2026-06-16T12:30:01.122+08:00',
    assistantFinish: '2026-06-16T12:30:02.400+08:00',
  },
})

try {
  await generateText({
    model,
    prompt,
    tools: {
      getWeather: tool({
        description: 'Return deterministic weather for a city.',
        inputSchema: jsonSchema({
          type: 'object',
          properties: {
            city: { type: 'string' },
            unit: { type: 'string', enum: ['celsius'] },
          },
          required: ['city', 'unit'],
          additionalProperties: false,
        }),
        execute: async ({ city, unit }) => ({
          city,
          unit,
          condition: 'light rain',
          temperature: 24,
        }),
      }),
    },
    stopWhen: stepCountIs(2),
    ...probe.callbacks,
  })
} catch (error) {
  probe.recordError(error)
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, probe.toJsonl())

const generated = await readFile(outputPath, 'utf8')
const run = parseProbeJsonl(generated, { filename: fileURLToPath(import.meta.url) })

console.log(`Wrote ${outputPath}`)
console.log(`Run: ${run.id}`)
console.log(`Events: ${run.events.length}`)
