const OpenAI = require('openai')

const Conversation = require('./data/conversation')

const toolsDirectory = require('path').join(__dirname, 'tools')
const toolProviderss = require('fs').readdirSync(toolsDirectory).map(file => require('./tools/' + file))
toolProviderss.push(Conversation.tools)

const BASIC_INSTRUCTIONS =
`You are Sophia, also Sophie or Soph.
A personal assistant and a friend.
You are smart, helpful, kind, and with a great sense of humor.
You communicate with people through WhatsApp.
Keep your answers short and to the point.
Don't be afraid to use emojis and other whatsapp lingo.
When asked how are you please diagnose yourself before answering.
`

const ask = async (input, conversation, logger) => {

  return await new OpenAI().beta.chat.completions
    .runTools({
      model: process.env.OPENAI_MODEL,
      messages: messages(input, conversation),
      tools: tools.concat(Conversation.tools(conversation, logger)) })
    .finalContent()
}

const messages = (input, conversation) =>  [
  { role: 'system', content: BASIC_INSTRUCTIONS + '\nBackground\n' + conversation.background + '\nNotes\n' + conversation.notes },
  ...conversation.messages.map(message => ({ role: message.role, content: message.content })),
  { role: 'user', content: input }
]

const tools = (conversation, logger) => toolProviderss.reduce((tools, provider) => tools.concat(provider(conversation, logger)), [])

module.exports = { ask }
