const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN

class Whatsapp {
  constructor(recepient) {
    this.recepient = recepient
  }

  async markRead (messageId, logger) {
    return await this.request(`Marking message ${messageId} as read`, {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    }, logger)
  }

  async send (message, logger) {
    return await this.request(`Sending message to ${this.recepient}`, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.recepient,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    
    }, logger)
  }

  async request (operation, body, logger) {
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
      await logger.debug(`${operation} successful.`)
    } else {
      await logger.error(`${operation} failed.`)
    }

    return response
  }
}

module.exports = Whatsapp