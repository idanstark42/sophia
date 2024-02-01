require('dotenv').config()
const express = require('express')

const sophia = require('./sophia')
const Conversation = require('./data/conversation')

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

  // Currently not allowing other people to talk to Sophia
  if (message.from !== process.env.IDANS_NUMBER) {
    return Conversation.get(message.from)
      .then(conversation => conversation.respond(message.text.body, 'Sorry, I am currently not available for conversations.'))
      .catch(error => console.log(error))
      .then(() => res.sendStatus(200))
  }

  const input = message.text.body
  Conversation.get(message.from)
    .then(conversation => {
      return sophia.ask(input, conversation)
        .then(output => conversation.respond(input, output))
    })
    .catch(error => console.log(error))
    .then(() => res.sendStatus(200))
})


app.listen(PORT, () => {
  console.log('Server is up on ' + PORT)
})