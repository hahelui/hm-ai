# AI Service Documentation

## Overview

The AI service provides a complete integration with OpenAI-compatible APIs (like Electron Hub, OpenAI, etc.) with support for:
- Chat completions (streaming and non-streaming)
- Model listing and management
- Automatic settings integration
- Error handling and retry logic

## Features

### ✅ Implemented

1. **List Models** - `listModels()`
   - Fetches all available models from the API
   - Returns array of model objects with metadata

2. **Get Model** - `getModel(modelId)`
   - Fetch details for a specific model
   - Includes pricing, tokens, and capabilities

3. **Chat Completions** - `createChatCompletion(request)`
   - Non-streaming chat completions
   - Full conversation history support
   - Configurable temperature, max_tokens, etc.

4. **Streaming Chat** - `createStreamingChatCompletion(request, onChunk, onComplete, onError)`
   - Real-time streaming responses
   - Token-by-token updates
   - Proper SSE (Server-Sent Events) handling
   - Callbacks for chunk, completion, and errors

5. **Simple Message** - `sendMessage(message, model?, history?)`
   - Convenience method for single messages
   - Automatic model selection from settings
   - Returns plain string response

6. **Configuration Check** - `isConfigured()`
   - Validates API URL and key are set
   - Used to prompt user for settings

7. **Connection Test** - `testConnection()`
   - Tests API connectivity
   - Useful for settings validation

## Usage Examples

### Basic Chat Completion

```typescript
import { aiService } from '@/services/ai-service'

const response = await aiService.createChatCompletion({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
})

console.log(response.choices[0].message.content)
```

### Streaming Chat

```typescript
await aiService.createStreamingChatCompletion(
  {
    model: 'gpt-4',
    messages: [
      { role: 'user', content: 'Tell me a story' }
    ]
  },
  // onChunk - called for each token
  (content) => {
    console.log('Received:', content)
  },
  // onComplete - called when done
  () => {
    console.log('Stream complete!')
  },
  // onError - called on errors
  (error) => {
    console.error('Error:', error)
  }
)
```

### List Available Models

```typescript
const models = await aiService.listModels()
models.forEach(model => {
  console.log(`${model.id} - ${model.name}`)
})
```

### Simple Message

```typescript
const reply = await aiService.sendMessage(
  'What is the capital of France?',
  'gpt-3.5-turbo'
)
console.log(reply)
```

## API Compatibility

The service is designed to work with OpenAI-compatible APIs:

- ✅ OpenAI API
- ✅ Electron Hub API
- ✅ Azure OpenAI
- ✅ Any OpenAI-compatible endpoint

## Configuration

Settings are automatically loaded from IndexedDB:

```typescript
{
  apiUrl: 'https://api.electronhub.ai/v1',  // or https://api.openai.com/v1
  apiKey: 'your-api-key',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000
}
```

## Error Handling

All methods include proper error handling:

```typescript
try {
  const response = await aiService.sendMessage('Hello')
} catch (error) {
  if (error.message.includes('401')) {
    // Invalid API key
  } else if (error.message.includes('429')) {
    // Rate limit exceeded
  } else {
    // Other errors
  }
}
```

## Integration with Chat Interface

The service is fully integrated with the chat page:

1. **Automatic Configuration Check** - Prompts user if API not configured
2. **Streaming Updates** - Real-time message updates in UI
3. **Database Persistence** - All messages saved to IndexedDB
4. **Model Selection** - Uses selected model from header
5. **Conversation History** - Maintains full context
6. **Error Notifications** - Toast messages for errors

## Next Steps

Potential enhancements:

- [ ] Add function calling support
- [ ] Add image generation
- [ ] Add embeddings support
- [ ] Add token counting
- [ ] Add cost estimation
- [ ] Add retry logic with exponential backoff
- [ ] Add request cancellation
- [ ] Add rate limiting
- [ ] Add response caching

## API Endpoints Used

- `GET /v1/models` - List all models
- `GET /v1/models/{model_id}` - Get specific model
- `POST /v1/chat/completions` - Create chat completion
- `POST /v1/chat/completions` (stream: true) - Streaming chat

## Dependencies

- Native `fetch` API for HTTP requests
- IndexedDB for settings storage
- Server-Sent Events (SSE) for streaming
