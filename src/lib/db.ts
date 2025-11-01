import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  chatId: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  id: string;
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

interface HMAIDB extends DBSchema {
  chats: {
    key: string;
    value: Chat;
    indexes: { 'by-date': number };
  };
  messages: {
    key: string;
    value: Message;
    indexes: { 'by-chat': string; 'by-timestamp': number };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

let dbInstance: IDBPDatabase<HMAIDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<HMAIDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<HMAIDB>('hm-ai-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 2) {
        // Delete old settings store if it exists
        if (db.objectStoreNames.contains('settings')) {
          db.deleteObjectStore('settings');
        }
        const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
        settingsStore.add({
          id: 'default',
          apiKey: '',
          apiUrl: 'https://api.openai.com/v1',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 4096,
        });
      }
      // Create chats store
      if (!db.objectStoreNames.contains('chats')) {
        const chatStore = db.createObjectStore('chats', { keyPath: 'id' });
        chatStore.createIndex('by-date', 'updatedAt');
      }

      // Create messages store
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('by-chat', 'chatId');
        messageStore.createIndex('by-timestamp', 'timestamp');
      }

    },
  });

  return dbInstance;
}

// Chat operations
export async function createChat(title: string): Promise<Chat> {
  const db = await getDB();
  const chat: Chat = {
    id: crypto.randomUUID(),
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.add('chats', chat);
  return chat;
}

export async function getAllChats(): Promise<Chat[]> {
  const db = await getDB();
  const chats = await db.getAllFromIndex('chats', 'by-date');
  return chats.reverse();
}

export async function getChat(id: string): Promise<Chat | undefined> {
  const db = await getDB();
  return db.get('chats', id);
}

export async function updateChat(id: string, updates: Partial<Chat>): Promise<void> {
  const db = await getDB();
  const chat = await db.get('chats', id);
  if (chat) {
    await db.put('chats', { ...chat, ...updates, updatedAt: Date.now() });
  }
}

export async function deleteChat(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('chats', id);
  
  // Delete all messages in this chat
  const messages = await getMessagesByChatId(id);
  for (const message of messages) {
    await db.delete('messages', message.id);
  }
}

// Message operations
export async function addMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const db = await getDB();
  const newMessage: Message = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  await db.add('messages', newMessage);
  
  // Update chat's updatedAt
  await updateChat(message.chatId, {});
  
  return newMessage;
}

export async function getMessagesByChatId(chatId: string): Promise<Message[]> {
  const db = await getDB();
  return db.getAllFromIndex('messages', 'by-chat', chatId);
}

export async function updateMessage(id: string, updates: Partial<Omit<Message, 'id' | 'timestamp'>>): Promise<void> {
  const db = await getDB();
  const message = await db.get('messages', id);
  if (message) {
    await db.put('messages', { ...message, ...updates });
  }
}

export async function deleteMessage(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('messages', id);
}

// Settings operations
export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put('settings', { ...settings, id: 'default' });
}

export async function getSettings(): Promise<Settings | undefined> {
  const db = await getDB();
  return db.get('settings', 'default');
}

export async function getDefaultSettings(): Promise<Settings> {
  return {
    id: 'default',
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 4096,
  };
}
