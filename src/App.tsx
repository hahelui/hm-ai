import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Settings, Sparkles, Download } from 'lucide-react'

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstalled(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl">
              <Sparkles className="w-12 h-12" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            HM-AI
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Your Personal AI Assistant
          </p>
          
          <p className="text-gray-400 max-w-xl mx-auto">
            Chat with AI using OpenAI-compatible APIs. Install as a PWA for the best experience on any device.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all">
            <MessageSquare className="w-8 h-8 mb-4 text-blue-400" />
            <h3 className="text-lg font-semibold mb-2">Smart Conversations</h3>
            <p className="text-gray-400 text-sm">
              Engage in natural conversations with AI powered by advanced language models
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all">
            <Settings className="w-8 h-8 mb-4 text-purple-400" />
            <h3 className="text-lg font-semibold mb-2">Customizable</h3>
            <p className="text-gray-400 text-sm">
              Configure your own API endpoint, model, and parameters
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all">
            <Download className="w-8 h-8 mb-4 text-pink-400" />
            <h3 className="text-lg font-semibold mb-2">Offline Ready</h3>
            <p className="text-gray-400 text-sm">
              Install as a PWA and access your chat history anytime, anywhere
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
            onClick={() => alert('Chat feature coming soon!')}
          >
            <MessageSquare className="w-5 h-5" />
            Start Chatting
          </Button>
          
          {!isInstalled && deferredPrompt && (
            <Button 
              size="lg" 
              variant="outline"
              className="border-gray-600 hover:bg-gray-800 px-8 py-6 text-lg"
              onClick={handleInstall}
            >
              <Download className="w-5 h-5" />
              Install App
            </Button>
          )}
          
          {isInstalled && (
            <div className="flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">App Installed</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="text-center text-gray-500 text-sm">
          <p>Progressive Web App • Works Offline • Cross-Platform</p>
        </div>
      </div>
    </div>
  )
}

export default App
