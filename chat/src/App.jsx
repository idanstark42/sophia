import { useState, useRef } from "react"

const TYPING_SPEED = 30

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null) // store conversation ID
  const controllerRef = useRef(null)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: "user", content: input }
    setMessages((m) => [...m, userMessage, { role: "assistant", content: "" }])
    setInput("")
    setLoading(true)

    controllerRef.current = new AbortController()

    const body = { prompt: input }
    if (conversationId) body.conversation_id = conversationId // send existing ID

    const res = await fetch("http://localhost:8000/assistant/conversation/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controllerRef.current.signal,
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    let firstChunk = true
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)

      // If first chunk contains conversation ID, extract it
      if (firstChunk && !conversationId) {
        const match = chunk.match(/\[CONVERSATION START (\S+)\]/)
        if (match) setConversationId(match[1])
        firstChunk = false
      }

      // Add letters one by one
      for (let i = 0; i < chunk.length; i++) {
        const letter = chunk[i]
        setMessages((msgs) => {
          const last = msgs[msgs.length - 1]
          const updated = { ...last, content: last.content + letter }
          return [...msgs.slice(0, -1), updated]
        })
        await new Promise((r) => setTimeout(r, 1000 / TYPING_SPEED))
      }
    }

    setLoading(false)
  }

  function cleanContent(content) {
    return content
      .replace(/\[CONVERSATION START.+?\]/, "")
      .replace(/\[CONVERSATION END.+?\]/, "")
      .replace(/\[[^\]]+?$/, "")
      .trim()
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h2>Assistant</h2>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "60vh",
          overflowY: "auto",
          marginBottom: "1rem",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "0.5rem" }}>
            <strong>{m.role}:</strong>{" "}
            <pre style={{ display: "inline", whiteSpace: "pre-wrap" }}>
              {cleanContent(m.content)}
            </pre>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1 }}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  )
}
