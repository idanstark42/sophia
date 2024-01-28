const express = require('express')
const sophia = require('./sophia')
const whatsapp = require('./whatsapp')

const PORT = process.env.PORT || 3000

const app = express()

// handle message from whatsapp bot
app.post('/message', express.json(), (req, res) => {
  const message = req.body.message.text
  sophia.ask(message).then(whatsapp.respond).catch(whatsapp.error)
  res.sendStatus(200)
})

app.listen(PORT, () => {
  console.log('Server is up on ' + PORT)
})