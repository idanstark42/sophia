const API_URL = "http://localhost:8000"

export const setToken = (t) => {
  sessionStorage.setItem("authToken", t)
}

const getToken = () => sessionStorage.getItem("authToken")

const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-api-key": getToken()
})

/* ---------- auth ---------- */

export const login = async (password) => {
  const res = await fetch(`${API_URL}/admin/login?password=${password}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
  if (!res.ok) throw new Error("Login failed")
  const data = await res.json()
  setToken(data.token)
  return data.token
}

/* ---------- conversations ---------- */

export const fetchConversations = async () => {
  const res = await fetch(`${API_URL}/admin/conversations`, {
    headers: getHeaders()
  })
  if (!res.ok) throw new Error("Failed to fetch conversations")
  return await res.json()
}

/* ---------- streaming ---------- */

export const streamMessage = async (conversationId, prompt, signal) => {
  const res = await fetch(`${API_URL}/assistant/conversation/stream`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      prompt,
      conversation_id: conversationId ?? null
    }),
    signal
  })

  if (!res.ok) throw new Error("Streaming failed")
  return res
}
