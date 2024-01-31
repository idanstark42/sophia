const requset = require('request-promise')

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN

const send = (convId, message) => {
  return requset(options(convId, message))
    .then(function (response) {
      console.log(response);
    })
    .catch(function (err) {
      console.error(err);
    });
}

const error = (convId, error) => {
  return send(convId, `Sorry, I'm having trouble understanding you. Please try again.`)
    .then(() => send(convId, error))
}

const options = (convId, message) => ({
  method: 'POST',
  url: `${WHATSAPP_API_URL}?token=${WHATSAPP_API_TOKEN}`,
  headers: { accept: 'application/json', 'content-type': 'application/json' },
  body: { typing_time: 10, to: convId, body: message },
  json: true
})

export default class Whatsapp {
  constructor(convId) {
    this.convId = convId
  }

  send(message) {
    return send(this.convId, message)
  }

  error(error) {
    return error(this.convId, error)
  }

}