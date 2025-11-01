import { getSettings } from '@/lib/db'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  input: string | ChatMessage[]
  instructions?: string
  temperature?: number
  max_output_tokens?: number
  stream?: boolean
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface ChatCompletionResponse {
  id: string
  object: string
  created: number
  model: string;
  output: Array<{
    id: string;
    type: string;
    status: string;
    role: string;
    content: Array<{
      type: string;
      text: string;
      annotations: any[];
    }>;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
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

      const body = {
        model: request.model,
        input: Array.isArray(request.input) ? request.input : [{ role: 'user', content: request.input }],
        instructions: request.instructions,
        temperature: request.temperature ?? settings?.temperature ?? 0.7,
        stream: false,
      };

      const response = await fetch(`${this.apiUrl}/responses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

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
   * Simple helper to send a single message and get a response
   */
  async sendMessage(
    message: string,
    model?: string,
    conversationHistory?: ChatMessage[]
  ): Promise<string> {
    const settings = await getSettings()
    const selectedModel = model || settings?.model || 'gpt-3.5-turbo'

    const response = await this.createChatCompletion({
      model: selectedModel,
      input: conversationHistory ? [...conversationHistory, { role: 'user', content: message }] : message,
    })

    return response.output[0].content[0].text
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
