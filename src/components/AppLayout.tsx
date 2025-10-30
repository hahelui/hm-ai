import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { ChatSidebar } from '@/components/ChatSidebar'
import { Outlet } from 'react-router-dom'

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ChatSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b p-2">
            <SidebarTrigger />
          </div>
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
