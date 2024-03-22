require('dotenv').config()
const express = require('express')

const sophia = require('./sophia')
const Conversation = require('./data/conversation')
const Logger = require('./data/log')

const PORT = process.env.PORT || 3000
const RANDOM_VERSION_ID = Math.random().toString(36).substring(7)

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
  const requestId = Math.random().toString(36).substring(7)
  const logger = new Logger({ requestId, versionId: RANDOM_VERSION_ID})
  
  if (!req.body.entry || req.body.entry.length === 0 || !req.body.entry[0].changes) {
    await logger.warn('Invalid request body.')
    await logger.warn(JSON.stringify(req.body))

    res.sendStatus(200)
    return
  }

  const changes = req.body.entry[0].changes
  if (changes.length === 0 || !changes[0].value || !changes[0].value.messages || changes[0].value.messages.length === 0) {
    await logger.warn('This event is not a message.')
    await logger.warn(JSON.stringify(changes))
    
    res.sendStatus(200)
    return
  }

  const message = changes[0].value.messages[0]
  await logger.debug('Received message: ' + JSON.stringify(message))

  if (await Conversation.exists(message.id)) {
    await logger.warn('This message has already been processed: ' + message.id)

    res.sendStatus(200)
    return
  }

  const conversation = await Conversation.get(message.from)

  // Currently not allowing other people to talk to Sophia
  if (message.from !== process.env.IDANS_NUMBER) {
    await logger.warn('This message is not from Idan: ' + message.from)
    await conversation.send('Sorry, I am currently not available for conversations.', logger)

    res.sendStatus(200)
    return
  }

  await conversation.markRead(message, logger)
  await conversation.send(await sophia.ask(message.text.body, conversation, logger), logger)

  res.sendStatus(200)
  return
})

app.get('/privacy_policy', (_req, res) => {
  res.redirect(process.env.PRIVACY_POLICY_URL)
})

app.get('/logs', async (req, res) => {
  // Load logs according to the query parameters
  const logs = await Logger.LogEntry.load(req.query)
  res.send(logs)
})

app.listen(PORT, () => {
  const logger = new Logger({ versionId: RANDOM_VERSION_ID })
  logger.info('Server is up on ' + PORT + '.')
})