import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { askAnjali, type ChatMessage } from './lib/gemini'
import './App.css'

const WELCOME: ChatMessage = {
  role: 'model',
  parts: [
    {
      text: 'Hey Babu! 😊 Kaise ho? Kya soch rahe ho? 💭',
    },
  ],
}

function App() {
  const [history, setHistory] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  async function handleSend() {
    const question = input.trim()
    if (!question || loading) return

    setError('')
    setInput('')

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: question }],
    }

    const apiHistory = history.filter((msg) => msg !== WELCOME)
    const nextHistory = [...apiHistory, userMessage]

    setHistory((prev) => {
      const withoutWelcome = prev.filter((msg) => msg !== WELCOME)
      return [...withoutWelcome, userMessage]
    })
    setLoading(true)

    try {
      const answer = await askAnjali(nextHistory, apiKey ?? '')
      const modelMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: answer }],
      }
      setHistory((prev) => [...prev, modelMessage])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  return (
    <div className="chat-app">
      <header className="chat-header">
        <div className="avatar" aria-hidden="true">
          A
        </div>
        <div className="header-text">
          <h1>Anjali</h1>
          <p className="status">
            <span className="status-dot" />
            Online
          </p>
        </div>
      </header>

      <div className="welcome-banner">Chat with Anjali — share your thoughts</div>

      <main className="chat-messages" aria-live="polite">
        {history.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={`bubble ${msg.role === 'user' ? 'user' : 'model'}`}
          >
            <p>{msg.parts[0].text}</p>
          </div>
        ))}

        {loading && (
          <div className="bubble model loading">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <div ref={bottomRef} />
      </main>

      <footer className="chat-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message Anjali..."
          rows={1}
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          {loading ? '…' : 'Send'}
        </button>
      </footer>
    </div>
  )
}

export default App
