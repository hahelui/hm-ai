import { getSettings } from '@/lib/db'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface Model {
  id: string
  object: string
  owned_by: string
  name?: string
  description?: string
  created?: number
  tokens?: number
  pricing?: {
    input: number
    output: number
  }
}

export interface ModelsResponse {
  object: string
  data: Model[]
}

export class AIService {
  private apiUrl: string = ''
  private apiKey: string = ''

  async initialize() {
    const settings = await getSettings()
    if (settings) {
      this.apiUrl = settings.apiUrl
      this.apiKey = settings.apiKey
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    await this.initialize()
    
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * List all available models
   */
  async listModels(): Promise<Model[]> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.apiUrl}/models`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ModelsResponse = await response.json()
      return data.data
    } catch (error) {
      // Only log if it's not an auth error (401)
      if (!(error as Error).message.includes('401')) {
        console.error('Failed to list models:', error)
      }
      throw error
    }
  }

  /**
   * Get a specific model by ID
   */
  async getModel(modelId: string): Promise<Model> {
    try {
      const headers = await this.getHeaders()
      const response = await fetch(`${this.apiUrl}/models/${modelId}`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // Only log if it's not an auth error (401)
      if (!(error as Error).message.includes('401')) {
        console.error('Failed to get model:', error)
      }
      throw error
    }
  }

  /**
   * Create a chat completion (non-streaming)
   */
  async createChatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    try {
      const settings = await getSettings()
      const headers = await this.getHeaders()

      const body: ChatCompletionRequest = {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? settings?.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? settings?.maxTokens ?? 2000,
        stream: false,
      }

      // Add optional parameters if provided
      if (request.top_p !== undefined) body.top_p = request.top_p
      if (request.frequency_penalty !== undefined)
        body.frequency_penalty = request.frequency_penalty
      if (request.presence_penalty !== undefined)
        body.presence_penalty = request.presence_penalty

      // Try /responses endpoint first (Electron Hub), fallback to /chat/completions (OpenAI)
      let response = await fetch(`${this.apiUrl}/responses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      // If /responses fails, try /chat/completions
      if (!response.ok && response.status === 404) {
        response = await fetch(`${this.apiUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error?.message ||
            `HTTP error! status: ${response.status}`
        )
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to create chat completion:', error)
      throw error
    }
  }

  /**
   * Create a streaming chat completion
   */
  async createStreamingChatCompletion(
    request: ChatCompletionRequest,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const settings = await getSettings()
      const headers = await this.getHeaders()

      const body: ChatCompletionRequest = {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? settings?.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? settings?.maxTokens ?? 2000,
        stream: true,
      }

      // Add optional parameters if provided
      if (request.top_p !== undefined) body.top_p = request.top_p
      if (request.frequency_penalty !== undefined)
        body.frequency_penalty = request.frequency_penalty
      if (request.presence_penalty !== undefined)
        body.presence_penalty = request.presence_penalty

      // Try /responses endpoint first (Electron Hub), fallback to /chat/completions (OpenAI)
      let response = await fetch(`${this.apiUrl}/responses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      // If /responses fails, try /chat/completions
      if (!response.ok && response.status === 404) {
        response = await fetch(`${this.apiUrl}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error?.message ||
            `HTTP error! status: ${response.status}`
        )
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          onComplete()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue

          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6)
              const data = JSON.parse(jsonStr)

              const content = data.choices?.[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to create streaming chat completion:', error)
      onError(error as Error)
    }
  }

  /**
   * Simple helper to send a single message and get a response
   */
  async sendMessage(
    message: string,
    model?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    const settings = await getSettings()
    const selectedModel = model || settings?.model || 'gpt-3.5-turbo'

    const messages: ChatMessage[] = [
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ]

    const response = await this.createChatCompletion({
      model: selectedModel,
      messages,
    })

    return response.choices[0].message.content
  }

  /**
   * Check if API is configured
   */
  async isConfigured(): Promise<boolean> {
    await this.initialize()
    return !!(this.apiUrl && this.apiKey)
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.listModels()
      return true
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  }
}

// Export a singleton instance
export const aiService = new AIService()
