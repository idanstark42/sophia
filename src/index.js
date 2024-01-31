const express = require('express')
const sophia = require('./sophia')
const Whatsapp = require('./whatsapp')
const { default: whatsapp } = require('./whatsapp')

const PORT = process.env.PORT || 3000

const app = express()

// handle message from whatsapp bot
app.post('/message', express.json(), (req, res) => {
  const message = req.body.message.text
  const conversation = new Whatsapp(req.body.message.chat_id)
  sophia.ask(message, [], { output: conversation.send, error: conversation.error })
  res.sendStatus(200)
})

app.listen(PORT, () => {
  console.log('Server is up on ' + PORT)
})