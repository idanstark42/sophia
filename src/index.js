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
  console.log('incoming webhook')
  console.log(req.body)

  const changes = req.body.entry[0].changes
  if (changes) {
    console.log('change')
    console.log(changes[0])
  }

  res.sendStatus(200)
  // const message = req.body.data.body
  // const conversation = new Whatsapp(req.body.data.from)
  // sophia.ask(message, { history: [], output: conversation.send, error: conversation.send }).then(() => {
  //   res.sendStatus(200)
  // }).catch(() => {
  //   res.sendStatus(500)
  // })
})

app.listen(PORT, () => {
  console.log('Server is up on ' + PORT)
})