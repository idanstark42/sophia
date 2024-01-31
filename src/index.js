require('dotenv').config()
const express = require('express')

const sophia = require('./sophia')
const Whatsapp = require('./whatsapp')

const PORT = process.env.PORT || 3000

const app = express()

app.get('/message', express.json(), (req, res) => {
  const message = req.body.data.body
  const conversation = new Whatsapp(req.body.data.from)
  sophia.ask(message, { history: [], output: conversation.send, error: conversation.send }).then(() => {
    res.sendStatus(200)
  }).catch(() => {
    res.sendStatus(500)
  })
})

app.listen(PORT, () => {
  console.log('Server is up on ' + PORT)
})