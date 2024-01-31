const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN

class Whatsapp {
  constructor(recepient) {
    this.recepient = recepient
  }

  async send (message) {
    return await fetch({
      url: WHATSAPP_API_URL,
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`
      },
      body: {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: this.recepient,
        type: "text",
        text: {
          preview_url: false,
          body: message
        }
      }
    })
  }
}