import { useState, useEffect, useRef } from "react"
import { IoMdSend } from "react-icons/io"
import { GiHamburgerMenu } from "react-icons/gi"
import { FaPlus } from "react-icons/fa"

import {
  login,
  fetchConversations,
  streamMessage
} from "./api"

const TYPING_SPEED = 30
const ID_REGEX = /\[CONVERSATION START (.+?)\]/

export default function App() {
  /* ---------- auth ---------- */
  const [authToken, setAuthToken] = useState(sessionStorage.getItem("authToken"))
  const [password, setPassword] = useState("")

  /* ---------- ui ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(false)

  /* ---------- conversations ---------- */
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")

  const controllerRef = useRef(null)

  /* ---------- effects ---------- */
  useEffect(() => {
    if (!authToken) return
    fetchConversations().then(setConversations)
  }, [authToken])

  /* ---------- handlers ---------- */
  const handleLogin = async () => {
    const token = await login(password)
    setAuthToken(token)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = { role: "user", content: input }
    const assistantMessage = { role: "assistant", content: "" }

    if (messages.length > 0 && messages[0].content.includes('[') && !activeConversation) {
      const activeConversationId = messages[0].content.match(ID_REGEX)[1]
      setActiveConversation(activeConversationId)
    }

    setMessages(m => [...m, userMessage, assistantMessage])
    setInput("")
    setLoading(true)

    controllerRef.current = new AbortController()

    const res = await streamMessage(
      activeConversation,
      userMessage.content,
      controllerRef.current.signal
    )

    const reader = res.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      if (chunk.replace(ID_REGEX, '').trim() === '' && (messages.length === 0 || messages[messages.length - 1].trim() === '')) {
        setMessages(m => {
          const last = m[m.length - 1]
          return [...m.slice(0, -1), { ...last, content: chunk }]
        })
      } else {
        for (const letter of chunk) {
          setMessages(m => {
            const last = m[m.length - 1]
            return [...m.slice(0, -1), { ...last, content: last.content + letter }]
          })
          await new Promise(r => setTimeout(r, 1000 / TYPING_SPEED))
        }
      }
    }

    setLoading(false)
  }

  if (!authToken) {
    return (
      <div className="auth card">
        <div>SOPHIA</div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>
            <IoMdSend />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="main">
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-button" onClick={() => setSidebarOpen(o => !o)}>
          <GiHamburgerMenu />
        </div>

        {conversations.map(c => (
          <div
            key={c.id}
            className={`item ${c.id === activeConversation ? "active" : ""}`}
            onClick={() => {
              setActiveConversation(c.id)
              setMessages(c.messages || [])
            }}
          >
            <b>{c.title || "Conversation"}</b>
          </div>
        ))}

        <div className="item create" onClick={() => {}}> {/* TODO */}
          <FaPlus />
        </div>
      </div>

      <div className="conversation">

        {messages.map((message, index) => <div className={`message ${message.role}`} key={index}>
          {(loading && index === messages.length - 1 && message.content.replace(ID_REGEX, '').trim() === '') ? '...' : message.content.replace(ID_REGEX, '')}
        </div>)}

        {messages.length > 0 ? <div className="gap" /> : ''}

        <div className="input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type a message…"
          />
          <button onClick={sendMessage} disabled={loading}>
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  )
}
