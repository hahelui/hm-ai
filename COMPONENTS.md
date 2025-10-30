# Installed shadcn-chatbot-kit Components

## License Information
- **License:** MIT License ✅
- **Free to use:** Yes (commercial & personal)
- **Credit required:** No (but appreciated)
- **Source:** https://github.com/Blazity/shadcn-chatbot-kit
- **Built by:** Blazity, based on shadcn/ui

## Installed Components

### Main Components

1. **Chat** (`src/components/ui/chat.tsx`)
   - Complete chat interface with message history
   - Auto-scrolling behavior
   - Typing indicators
   - Stop generation capability
   - Prompt suggestions support

2. **Message List** (`src/components/ui/message-list.tsx`)
   - Renders list of chat messages
   - Auto-scroll functionality
   - Manual scroll override

3. **Chat Message** (`src/components/ui/chat-message.tsx`)
   - Individual message component
   - Supports user and assistant roles
   - File attachment display
   - Tool execution states
   - Message actions (copy, rate, etc.)

4. **Message Input** (`src/components/ui/message-input.tsx`)
   - Auto-resize textarea
   - File upload support
   - File preview
   - Voice input support (WIP)
   - Submit button with loading states

### Utility Components

5. **Markdown Renderer** (`src/components/ui/markdown-renderer.tsx`)
   - Renders markdown content
   - Syntax highlighting support
   - Math equations (KaTeX)
   - GitHub Flavored Markdown

6. **Prompt Suggestions** (`src/components/ui/prompt-suggestions.tsx`)
   - Quick action buttons
   - Helps users get started

7. **Typing Indicator** (`src/components/ui/typing-indicator.tsx`)
   - Shows when AI is thinking/typing
   - Animated dots

8. **Copy Button** (`src/components/ui/copy-button.tsx`)
   - Copy text to clipboard
   - Visual feedback

9. **File Preview** (`src/components/ui/file-preview.tsx`)
   - Preview uploaded files
   - Image thumbnails
   - File metadata display

10. **Audio Visualizer** (`src/components/ui/audio-visualizer.tsx`)
    - Visual feedback for audio recording
    - Waveform display

11. **Interrupt Prompt** (`src/components/ui/interrupt-prompt.tsx`)
    - Prompt to interrupt ongoing operations
    - Cancel running tasks

12. **Collapsible** (`src/components/ui/collapsible.tsx`)
    - Expandable/collapsible sections
    - Used for tool outputs

13. **Sonner** (`src/components/ui/sonner.tsx`)
    - Toast notifications
    - Success/error messages

## Custom Hooks

1. **use-auto-scroll** (`src/hooks/use-auto-scroll.ts`)
   - Smart auto-scrolling for message list

2. **use-autosize-textarea** (`src/hooks/use-autosize-textarea.ts`)
   - Auto-resize textarea based on content

3. **use-audio-recording** (`src/hooks/use-audio-recording.ts`)
   - Handle audio recording functionality

4. **use-copy-to-clipboard** (`src/hooks/use-copy-to-clipboard.ts`)
   - Copy text to clipboard with feedback

## Utilities

- **audio-utils** (`src/lib/audio-utils.ts`)
  - Audio processing utilities

## Dependencies Added

```json
{
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x",
  "remark-math": "^6.x",
  "rehype-katex": "^7.x",
  "rehype-highlight": "^7.x",
  "sonner": "^1.x"
}
```

## Usage Example

```tsx
import { Chat } from "@/components/ui/chat"

function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  
  return (
    <Chat
      messages={messages}
      input={input}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isGenerating={isLoading}
    />
  )
}
```

## Next Steps

1. Integrate with OpenAI API
2. Connect to IndexedDB for chat history
3. Add settings page for API configuration
4. Implement routing between pages
5. Customize theme and styling

## Documentation

- Full docs: https://shadcn-chatbot-kit.vercel.app/docs
- Demo: https://shadcn-chatbot-kit.vercel.app/demo
- GitHub: https://github.com/Blazity/shadcn-chatbot-kit
