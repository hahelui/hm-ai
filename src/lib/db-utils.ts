import { getDB, getAllChats, getMessagesByChatId, getSettings } from './db'

export async function exportDatabase(): Promise<string> {
  try {
    const chats = await getAllChats()
    const settings = await getSettings()
    
    // Get all messages for all chats
    const messagesMap: Record<string, any[]> = {}
    for (const chat of chats) {
      const messages = await getMessagesByChatId(chat.id)
      messagesMap[chat.id] = messages
    }

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      chats,
      messages: messagesMap,
      settings,
    }

    return JSON.stringify(exportData, null, 2)
  } catch (error) {
    console.error('Failed to export database:', error)
    throw new Error('Failed to export database')
  }
}

export async function importDatabase(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData)
    
    if (!data.version || !data.chats) {
      throw new Error('Invalid export file format')
    }

    const db = await getDB()
    
    // Import chats
    for (const chat of data.chats) {
      await db.put('chats', chat)
    }

    // Import messages
    if (data.messages) {
      for (const chatId in data.messages) {
        const messages = data.messages[chatId]
        for (const message of messages) {
          await db.put('messages', message)
        }
      }
    }

    // Import settings
    if (data.settings) {
      await db.put('settings', data.settings)
    }

    console.log('Database imported successfully')
  } catch (error) {
    console.error('Failed to import database:', error)
    throw new Error('Failed to import database: ' + (error as Error).message)
  }
}

export async function clearAllData(): Promise<void> {
  try {
    const db = await getDB()
    
    // Clear all object stores
    await db.clear('chats')
    await db.clear('messages')
    await db.clear('settings')
    
    console.log('All data cleared successfully')
  } catch (error) {
    console.error('Failed to clear data:', error)
    throw new Error('Failed to clear all data')
  }
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
