
const GDRIVE_URL = process.env.GDRIVE_URL

exports.action = async function (action, params) {
  const query = { action, ...params }
  return await fetch(`${GDRIVE_URL}?${Object.entries(query).map(([key, value]) => `${key}=${value}`).join('&')}`).then(response => response.json())
}
