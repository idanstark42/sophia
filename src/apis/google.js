
const GOOGLE_API_URL = process.env.GOOGLE_API_URL

exports.action = async function (action, params) {
  const query = { action, ...params }
  return await fetch(`${GOOGLE_API_URL}?${Object.entries(query).map(([key, value]) => `${key}=${value}`).join('&')}`).then(response => response.json())
}
