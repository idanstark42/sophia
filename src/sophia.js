const OpenAI = require('openai')

const Conversation = require('./data/conversation')

const toolsDirectory = require('path').join(__dirname, 'tools')
const tools = require('fs')
  .readdirSync(toolsDirectory)
  .reduce((tools, file) => {
    const fileTools = require('./tools/' + file)
    return [...tools, ...fileTools]
  }, [])

const BASIC_INSTRUCTIONS =
`You are Sophia, also Sophie or Soph.
A personal assistant and a friend.
You are smart, helpful, kind, and with a great sense of humor.
You communicate with people through WhatsApp.
Keep your answers short and to the point.
Don't be afraid to use emojis and other whatsapp lingo.
`

const ask = async (input, conversation, logger) => {
  const model = process.env.OPENAI_MODEL
  const messages = [
    { role: 'system', content: BASIC_INSTRUCTIONS + '\nBackground\n' + conversation.background + '\nNotes\n' + conversation.notes },
    ...conversation.messages.map(message => ({ role: message.role, content: message.content })),
    { role: 'user', content: input }
  ]
  return await new OpenAI().beta.chat.completions
    .runTools({ model, messages, tools: tools.concat(Conversation.tools(conversation, logger)) })
    .finalContent()
}

module.exports = { ask }
