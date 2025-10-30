import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { MessageSquare, Plus, Settings, Trash2, Sparkles } from 'lucide-react'
import { getAllChats, deleteChat, type Chat } from '@/lib/db'

export function ChatSidebar() {
  const navigate = useNavigate()
  const { chatId } = useParams()
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const allChats = await getAllChats()
      setChats(allChats)
    } catch (error) {
      console.error('Failed to load chats:', error)
    }
  }

  const handleNewChat = () => {
    navigate('/')
    // Reload chats to refresh the list
    setTimeout(loadChats, 100)
  }

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(id)
        await loadChats()
        
        // If we deleted the current chat, navigate to home
        if (id === chatId) {
          navigate('/')
        }
      } catch (error) {
        console.error('Failed to delete chat:', error)
      }
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">HM-AI</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="px-3 py-2">
            <Button 
              onClick={handleNewChat}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Chat History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.length === 0 ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No chats yet. Start a new conversation!
                </div>
              ) : (
                chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      onClick={() => navigate(`/chat/${chat.id}`)}
                      isActive={chatId === chat.id}
                      className="group"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{chat.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(chat.updatedAt)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6"
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
