const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN

class Whatsapp {
  constructor(recepient) {
    this.recepient = recepient
  }

  async send (message) {
    console.log('Sending message to ' + this.recepient + ': ' + message)
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: this.recepient,
        type: "text",
        text: {
          preview_url: false,
          body: message
        }
      })
    })
    if (response.ok) {
      console.log('Message sent.')
    } else {
      console.log('Message failed to send.')
    }
  }
}

module.exports = Whatsapp