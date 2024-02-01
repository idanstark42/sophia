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

app.post('/webhooks', express.json(), async (req, res) => {
  if (!req.body.entry || req.body.entry.length === 0 || !req.body.entry[0].changes) {
    console.log('Invalid request body.')
    console.log(req.body)

    res.sendStatus(200)
    return
  }

  const changes = req.body.entry[0].changes
  if (changes.length === 0 || !changes[0].value || !changes[0].value.messages || changes[0].value.messages.length === 0) {
    console.log('This event is not a message.')
    console.log(changes)
    
    res.sendStatus(200)
    return
  }

  const message = changes[0].value.messages[0]
  const conversation = await Conversation.get(message.from)

  // Currently not allowing other people to talk to Sophia
  if (message.from !== process.env.IDANS_NUMBER) {
    await conversation.respond(message.text.body, 'Sorry, I am currently not available for conversations.')

    res.sendStatus(200)
    return
  }

  const input = message.text.body
  const output = await sophia.ask(input, conversation)
  await conversation.respond(input, output)

  res.sendStatus(200)
  return
})

app.get('/privacy_policy', (req, res) => {
  res.redirect(process.env.PRIVACY_POLICY_URL)
})

app.listen(PORT, () => {
  console.log('Server is up on ' + PORT)
})