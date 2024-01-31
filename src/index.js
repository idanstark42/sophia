require('dotenv').config()
const express = require('express')

const sophia = require('./sophia')
const Whatsapp = require('./whatsapp')

const PORT = process.env.PORT || 3000

const app = express()

app.get('/webhooks', express.json(), (req, res) => {
  const mode = req.query['hub.mode']
  const verify_token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']
  if (mode !== 'subscribe' || verify_token !== process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    res.sendStatus(403)
    return
  }
  res.send(challenge)
})

app.post('/webhooks', express.json(), (req, res) => {
  const changes = req.body.entry[0].changes
  if (!changes) {
    res.sendStatus(200)
    return
  }

  const message = changes[0].value.messages[0]
  if (!message) {
    res.sendStatus(200)
    return
  }

  if (message.from !== process.env.IDANS_NUMBER) {
    res.sendStatus(200)
    return
  }

  const conversation = new Whatsapp(message.from)

  sophia.ask(message.text.body, { history: [] }).then(response => {
    conversation.send(response)
    res.sendStatus(200)
  }).catch(error => {
    console.log(error)
    res.sendStatus(500)
  })
})

app.listen(PORT, () => {
  console.log('Server is up on ' + PORT)
})