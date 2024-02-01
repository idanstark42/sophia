const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN

class Whatsapp {
  constructor(recepient) {
    this.recepient = recepient
  }

  async markRead (messageId) {
    return await this.request(`Marking message ${messageId} as read`, {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId
    })
  }

  async send (message) {
    return await this.request(`Sending message to ${this.recepient}`, {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: this.recepient,
      type: "text",
      text: {
        preview_url: false,
        body: message
      }
    
    })
  }

  async request (operation, body) {
    const response = await fetch(WHATSAPP_API_URL, {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
      },
      body: JSON.stringify(body)
    })

    if (response.ok) {
      console.log(`${operation} successful.`)
    } else {
      console.log(`${operation} failed.`)
    }

    return response
  }
}

module.exports = Whatsapp