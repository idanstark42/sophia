let token = null

let mockData = {
  tools: [
    { _id: 't1', name: 'Tool A', description: 'A test tool', base_url: 'https://api.a.com', auth: {}, actions: [] },
    { _id: 't2', name: 'Tool B', description: 'Another tool', base_url: 'https://api.b.com', auth: {}, actions: [] }
  ],
  protocols: [
    { _id: 'p1', name: 'Protocol X', description: 'Test protocol', commands: ['cmd1', 'cmd2'] }
  ],
  routines: [
    { _id: 'r1', name: 'Routine Alpha', description: 'Daily routine', protocols: ['p1'], trigger: 'daily 08:00' }
  ],
  settings: [
    { _id: 's1', name: 'Default', description: 'Default config', active: true, config: { key: 'value' } }
  ]
}

export const setToken = (t) => {
  token = t
  sessionStorage.setItem('authToken', t)
}

export const login = async (password) => {
  // just accept any password for testing
  const fakeToken = 'mock-token'
  setToken(fakeToken)
  return fakeToken
}

export const fetchItems = async (type) => {
  await new Promise(r => setTimeout(r, 100)) // simulate network delay
  if (!token) throw new Error('Unauthorized')
  return mockData[type] || []
}

export const saveItem = async (type, id, data) => {
  await new Promise(r => setTimeout(r, 100))
  if (!token) throw new Error('Unauthorized')
  const index = mockData[type].findIndex(i => i._id === id)
  if (index >= 0) mockData[type][index] = { ...mockData[type][index], ...data }
  return mockData[type][index]
}
