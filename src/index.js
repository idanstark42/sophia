require('dotenv').config()
const express = require('express')
const fs = require('fs')

const sophia = require('./sophia')
const Conversation = require('./data/conversation')
const Logger = require('./data/log')

const PORT = process.env.PORT || 3000
const RANDOM_VERSION_ID = Math.random().toString(36).substring(7)

const app = express()

app.use((req, _res, next) => {
  const requestId = Math.random().toString(36).substring(7)
  req.logger = new Logger({ requestId, versionId: RANDOM_VERSION_ID})
  next()
})

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
    await req.logger.warn('Invalid request body.')
    await req.logger.warn(JSON.stringify(req.body))

    res.sendStatus(200)
    return
  }

  const changes = req.body.entry[0].changes
  if (changes.length === 0 || !changes[0].value || !changes[0].value.messages || changes[0].value.messages.length === 0) {
    await req.logger.warn('This event is not a message.')
    await req.logger.warn(JSON.stringify(changes))
    
    res.sendStatus(200)
    return
  }

  const message = changes[0].value.messages[0]
  await req.logger.debug('Received message: ' + JSON.stringify(message))

  if (await Conversation.exists(message.id)) {
    await req.logger.warn('This message has already been processed: ' + message.id)

    res.sendStatus(200)
    return
  }

  const conversation = await Conversation.get(message.from)

  // Currently not allowing other people to talk to Sophia
  if (message.from !== process.env.IDANS_NUMBER) {
    await req.logger.warn('This message is not from Idan: ' + message.from)
    await conversation.send('Sorry, I am currently not available for conversations.', req.logger)

    res.sendStatus(200)
    return
  }

  await conversation.markRead(message, req.logger)
  await conversation.send(await sophia.ask(message.text.body, conversation, req.logger), req.logger)

  res.sendStatus(200)
  return
})

app.get('/privacy_policy', (_req, res) => {
  res.redirect(process.env.PRIVACY_POLICY_URL)
})

app.get('/logs', async (req, res) => {
  // Load logs according to the query parameters
  const limit = Number(req.query.limit) || 100
  delete req.query.limit
  const logs = await Logger.LogEntry.load(req.query, limit)
  res.send(logs)
})

app.get('/dashboard', async (req, res) => {
  const dashboardHTML = fs.readFileSync('./ui/dashboard.html', 'utf8')
  res.send(dashboardHTML)
})

app.get('/test/:tool', async (req, res) => {
  const params = req.query
  const tools = await sophia.tools(new Conversation({}), req.logger)
  const toolFunction = tools.find(tool => tool.function && tool.function.function.name === req.params.tool)
  if (!toolFunction) {
    res.send('Tool not found.')
    return
  }

  const result = await toolFunction.function.function(params)
  res.send(result)
})

app.listen(PORT, () => {
  const logger = new Logger({ versionId: RANDOM_VERSION_ID })
  logger.info('Server is up on ' + PORT + '.')
})