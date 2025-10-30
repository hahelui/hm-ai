import { useState, useEffect } from 'react'
import { Chat } from '@/components/ui/chat'
import { useParams } from 'react-router-dom'
import { getMessagesByChatId, addMessage, getChat, createChat, updateChat, type Message } from '@/lib/db'

export function ChatPage() {
  const { chatId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

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

      // TODO: Call OpenAI API here
      // For now, just add a placeholder assistant message
      setTimeout(async () => {
        const assistantMsg = await addMessage({
          role: 'assistant',
          content: 'This is a placeholder response. API integration coming soon!',
          chatId: activeChatId!,
        })
        
        setMessages(prev => [...prev, assistantMsg])
        setIsGenerating(false)
      }, 1000)

    } catch (error) {
      console.error('Failed to send message:', error)
      setIsGenerating(false)
    }
  }

  const handleStop = () => {
    setIsGenerating(false)
  }

  return (
    <div className="h-full w-full p-4">
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
  )
}
