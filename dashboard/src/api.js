import emptyItemFactory from './models'

const API_URL = 'http://localhost:8000'

export const setToken = (t) => {
  sessionStorage.setItem('authToken', t)
}

const getToken = () => sessionStorage.getItem('authToken')

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': getToken()
})

export const login = async (password) => {
  const res = await fetch(`${API_URL}/admin/login?password=${password}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!res.ok) throw new Error('Login failed')
  const data = await res.json()
  setToken(data.token)
  return data.token
}

export const fetchItems = async (type) => {
  const res = await fetch(`${API_URL}/admin/${type}`, { headers: getHeaders() })
  if (!res.ok) throw new Error('Failed to fetch items')
  return await res.json()
}

export const saveItem = async (type, id, data) => {
  const res = await fetch(`${API_URL}/admin/${type}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('Failed to save item')
  return await res.json()
}

export const createItem = async (type) => {
  const res = await fetch(`${API_URL}/admin/${type}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(emptyItemFactory[type]())
  })
  if (!res.ok) throw new Error('Failed to create item')
  return await res.json()
}

export const deleteItem = async (type, id) => {
  const res = await fetch(`${API_URL}/admin/${type}/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  })
  if (!res.ok) throw new Error('Failed to create item')
  return await res.json()
}
