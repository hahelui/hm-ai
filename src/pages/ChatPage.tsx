import { useState, useEffect } from 'react'
import { Chat } from '@/components/ui/chat'
import { useParams, useNavigate } from 'react-router-dom'
import { getMessagesByChatId, addMessage, updateMessage, getChat, createChat, updateChat, getSettings, type Message } from '@/lib/db'
import { ModelSelector } from '@/components/ModelSelector'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { aiService, type ChatMessage, type Model } from '@/services/ai-service'
import { toast } from 'sonner'

export function ChatPage() {
  const { chatId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [modelMaxTokens, setModelMaxTokens] = useState<number | null>(null)

  // Load default model from settings on mount
  useEffect(() => {
    loadDefaultModel()
  }, [])

  const loadDefaultModel = async () => {
    const settings = await getSettings()
    if (settings?.model) {
      setSelectedModel(settings.model)
      if (settings.maxTokens) {
        setModelMaxTokens(settings.maxTokens)
      }
    } else {
      setSelectedModel('gpt-3.5-turbo')
    }
  }

  // Load messages when chatId changes
  useEffect(() => {
    if (chatId) {
      loadMessages(chatId)
      setCurrentChatId(chatId)
    } else {
      setMessages([])
      setCurrentChatId(null)
    }
  }, [chatId])

  const loadMessages = async (id: string) => {
    try {
      const chatMessages = await getMessagesByChatId(id)
      setMessages(chatMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim()) return

    // Check if API is configured
    const isConfigured = await aiService.isConfigured()
    if (!isConfigured) {
      toast.error('Please configure your API settings first', {
        action: {
          label: 'Settings',
          onClick: () => window.location.href = '/settings',
        },
      })
      return
    }

    const userMessage = input.trim()
    setInput('')
    setIsGenerating(true)

    try {
      // Create new chat if none exists
      let activeChatId = currentChatId
      if (!activeChatId) {
        const newChat = await createChat(userMessage.slice(0, 50))
        activeChatId = newChat.id
        setCurrentChatId(activeChatId)
        // Navigate to new chat
        window.history.pushState({}, '', `/chat/${activeChatId}`)
      }

      // Add user message
      const userMsg = await addMessage({
        role: 'user',
        content: userMessage,
        chatId: activeChatId,
      })

      setMessages(prev => [...prev, userMsg])

      // Create placeholder assistant message
      const assistantMsg = await addMessage({
        role: 'assistant',
        content: '',
        chatId: activeChatId,
      })

      setMessages(prev => [...prev, assistantMsg])

      // Convert messages to API format
      const conversationHistory: ChatMessage[] = messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }))

      const response = await aiService.createChatCompletion({
       model: selectedModel,
       input: [
         ...conversationHistory,
         { role: 'user', content: userMessage },
       ],
       max_output_tokens: modelMaxTokens || undefined,
     });
     
     const assistantResponse = response.output[0].content[0].text;

     await updateMessage(assistantMsg.id, {
       content: assistantResponse,
     });

     setMessages(prev =>
       prev.map(m =>
         m.id === assistantMsg.id
           ? { ...m, content: assistantResponse }
           : m
       )
     )

     setIsGenerating(false);

    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message: ' + (error as Error).message)
      setIsGenerating(false)
    }
  }

  const handleStop = () => {
    setIsGenerating(false)
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
  }

  const handleModelDetails = (model: Model) => {
    if (model.tokens) {
      setModelMaxTokens(model.tokens)
      toast.success(`Model max tokens: ${model.tokens.toLocaleString()}`)
    }
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Model Selector Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium text-muted-foreground">Model:</span>
          <ModelSelector 
            value={selectedModel} 
            onValueChange={handleModelChange}
            onModelDetails={handleModelDetails}
          />
        </div>
        {currentChatId && (
          <span className="text-xs text-muted-foreground">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {/* Chat Area */}
      <div className="flex-1 overflow-hidden p-4">
        <Chat
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isGenerating={isGenerating}
          stop={handleStop}
          className="h-full"
        />
      </div>
    </div>
  )
}
