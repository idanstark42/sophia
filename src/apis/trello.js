const TRELLO_API_ROOT = 'https://api.trello.com'
const TRELLO_API_KEY = process.env.TRELLO_API_KEY
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN

const url = path => {
  const containsParams = path.includes('?')
  return `${TRELLO_API_ROOT}${path}${containsParams ? '&' : '?'}key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`
}

exports.get = async (path) => {
  const response = await fetch(url(path))
  return await response.json()
}

exports.post = async (path, body) => {
  const response = await fetch(url(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return await response.json()
}

exports.put = async (path, body) => {
  const response = await fetch(url(path), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return await response.json()
}

