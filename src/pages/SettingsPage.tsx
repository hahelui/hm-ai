import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ModelSelector } from '@/components/ModelSelector'
import { toast } from 'sonner'
import {
  Settings,
  Save,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react'
import {
  getSettings,
  saveSettings,
  getDefaultSettings,
  type Settings as SettingsType,
} from '@/lib/db'
import {
  exportDatabase,
  importDatabase,
  clearAllData,
  downloadJSON,
} from '@/lib/db-utils'

export function SettingsPage() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      let currentSettings = await getSettings()
      if (!currentSettings) {
        currentSettings = await getDefaultSettings()
      }
      setSettings(currentSettings)
    } catch (error) {
      console.error('Failed to load settings:', error)
      toast.error('Failed to load settings')
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      await saveSettings(settings)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await exportDatabase()
      const filename = `hm-ai-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadJSON(data, filename)
      toast.success('Database exported successfully!')
    } catch (error) {
      console.error('Failed to export:', error)
      toast.error('Failed to export database')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      await importDatabase(text)
      toast.success('Database imported successfully!')
      // Reload settings after import
      await loadSettings()
      // Reload the page to refresh chat history
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Failed to import:', error)
      toast.error('Failed to import database: ' + (error as Error).message)
    } finally {
      setIsImporting(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const handleNuke = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL your chats, messages, and settings. This action cannot be undone!\n\nAre you absolutely sure?'
    )

    if (!confirmed) return

    const doubleConfirm = window.confirm(
      '🚨 FINAL WARNING: All data will be lost forever. Type "DELETE" in the next prompt to confirm.'
    )

    if (!doubleConfirm) return

    const userInput = window.prompt('Type "DELETE" to confirm:')
    if (userInput !== 'DELETE') {
      toast.error('Deletion cancelled')
      return
    }

    setIsClearing(true)
    try {
      await clearAllData()
      toast.success('All data cleared successfully')
      // Reset to default settings
      const defaultSettings = await getDefaultSettings()
      setSettings(defaultSettings)
      // Reload the page
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error('Failed to clear data:', error)
      toast.error('Failed to clear data')
    } finally {
      setIsClearing(false)
    }
  }

  if (!settings) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <SidebarTrigger />
        <div className="h-4 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Settings className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* API Configuration */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">API Configuration</h2>
              <p className="text-sm text-muted-foreground">
                Configure your OpenAI-compatible API settings
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API Endpoint</Label>
                <Input
                  id="apiUrl"
                  type="url"
                  placeholder="https://api.openai.com/v1"
                  value={settings.apiUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, apiUrl: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  The base URL for your API endpoint
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={settings.apiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, apiKey: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Your API key will be stored locally and never sent to our servers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Default Model</Label>
                <ModelSelector 
                  value={settings.model} 
                  onValueChange={(value) => setSettings({ ...settings, model: value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">0 to 2</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    min="1"
                    max="32000"
                    value={settings.maxTokens}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxTokens: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </section>

          <Separator />

          {/* Data Management */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Data Management</h2>
              <p className="text-sm text-muted-foreground">
                Export, import, or clear your data
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                variant="outline"
                className="w-full gap-2 justify-start"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export Database'}
              </Button>

              <div>
                <input
                  type="file"
                  id="import-file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={isImporting}
                />
                <Button
                  onClick={() => document.getElementById('import-file')?.click()}
                  disabled={isImporting}
                  variant="outline"
                  className="w-full gap-2 justify-start"
                >
                  <Upload className="w-4 h-4" />
                  {isImporting ? 'Importing...' : 'Import Database'}
                </Button>
              </div>

              <div className="pt-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-destructive">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        This action will permanently delete all your data
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleNuke}
                    disabled={isClearing}
                    variant="destructive"
                    className="w-full gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isClearing ? 'Clearing...' : 'Delete All Data'}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
