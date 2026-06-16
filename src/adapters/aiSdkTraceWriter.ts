import { ProbeTraceWriter } from '../lib/traceWriter'
import type { ProbeEvent } from '../types/trace'

export type AiSdkTraceWriterOptions = {
  runId: string
  model: string
  startedAt?: string
  title?: string
}

export type AiSdkToolCall = {
  id?: string
  timestamp?: string
  name: string
  args: Record<string, unknown>
}

export type AiSdkToolResult = {
  toolCallId?: string
  timestamp?: string
  name: string
  result: unknown
  durationMs?: number
}

export type AiSdkFinish = {
  timestamp?: string
  text: string
  finishReason?: string
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
}

export class AiSdkTraceWriter {
  private readonly writer: ProbeTraceWriter
  private readonly latestToolCallIdByName = new Map<string, string>()
  private nextToolCallIndex = 1
  private nextToolResultIndex = 1

  constructor(options: AiSdkTraceWriterOptions) {
    this.writer = new ProbeTraceWriter({
      runId: options.runId,
      title: options.title,
      startedAt: options.startedAt,
      model: options.model,
    })
  }

  recordUserPrompt(prompt: string, timestamp?: string): ProbeEvent {
    return this.writer.record({
      id: 'user_prompt',
      timestamp,
      type: 'user_message',
      source: 'ui',
      title: 'User prompt submitted',
      summary: prompt,
      payload: { prompt },
    })
  }

  recordModelCall(input: { model: string; prompt: string; timestamp?: string }): ProbeEvent {
    const { timestamp, ...payload } = input

    return this.writer.record({
      id: 'model_call',
      parentId: 'user_prompt',
      timestamp,
      type: 'model_call',
      source: 'model',
      title: 'AI SDK model call',
      summary: `Call ${input.model} with the user prompt.`,
      payload,
    })
  }

  recordToolCall(toolCall: AiSdkToolCall): ProbeEvent {
    const id = toolCall.id ?? `tool_call_${toolCall.name}_${this.nextToolCallIndex}`
    this.nextToolCallIndex += 1
    this.latestToolCallIdByName.set(toolCall.name, id)

    return this.writer.record({
      id,
      parentId: 'model_call',
      timestamp: toolCall.timestamp,
      type: 'tool_call',
      source: 'tool',
      title: `Tool call: ${toolCall.name}`,
      summary: `Invoke ${toolCall.name} from the AI SDK step.`,
      payload: {
        tool: toolCall.name,
        args: toolCall.args,
      },
    })
  }

  recordToolResult(toolResult: AiSdkToolResult): ProbeEvent {
    const parentId = toolResult.toolCallId ?? this.latestToolCallIdByName.get(toolResult.name)
    const id = `tool_result_${toolResult.name}_${this.nextToolResultIndex}`
    this.nextToolResultIndex += 1

    return this.writer.record({
      id,
      parentId,
      timestamp: toolResult.timestamp,
      type: 'tool_result',
      source: 'tool',
      title: `Tool result: ${toolResult.name}`,
      summary: `Receive ${toolResult.name} result from the AI SDK step.`,
      durationMs: toolResult.durationMs,
      payload: {
        tool: toolResult.name,
        result: toolResult.result,
      },
    })
  }

  recordAssistantFinish(finish: AiSdkFinish): ProbeEvent {
    return this.writer.record({
      id: 'assistant_finish',
      parentId: 'model_call',
      timestamp: finish.timestamp,
      type: 'assistant_delta',
      source: 'agent',
      title: 'Assistant response completed',
      summary: finish.text,
      payload: {
        text: finish.text,
        finishReason: finish.finishReason,
      },
      tokens: finish.usage,
    })
  }

  recordError(error: unknown): ProbeEvent {
    return this.writer.record({
      id: 'ai_sdk_error',
      type: 'error',
      source: 'system',
      title: 'AI SDK run failed',
      summary: error instanceof Error ? error.message : 'Unknown AI SDK error.',
      status: 'error',
      payload: {
        message: error instanceof Error ? error.message : String(error),
      },
    })
  }

  toJsonl(): string {
    return this.writer.toJsonl()
  }
}
