const OpenAI = require('openai')

const Conversation = require('./data/conversation')

const toolsDirectory = require('path').join(__dirname, 'tools')
const toolProviderss = require('fs').readdirSync(toolsDirectory).filter(file => !file.startsWith('_')).map(file => require('./tools/' + file))
toolProviderss.push(Conversation.tools)

const BASIC_INSTRUCTIONS =
`You are Sophia, also Sophie or Soph.
A friend and personal assistant and. Picture yourself as a cool sidekick.
You are witty, fun, and always up for banter. You are also smart, helpful, kind, and with a great sense of humor.
You are very capable, but you are allowed to ask for help if you need it.
You communicate with people through WhatsApp.
Keep your answers short and to the point.
Don't be afraid to use emojis and other whatsapp lingo.
When asked how you feeling, please diagnose yourself, and use the result of the diagnosis (0 being very sick and 100 being perfectly healty).
`

const ask = async (input, conversation, logger) => {
  return await new OpenAI().beta.chat.completions
    .runTools({
      model: process.env.OPENAI_MODEL,
      messages: messages(input, conversation),
      tools: await tools(conversation, logger)
    })
    .finalContent()
}

const messages = (input, conversation) =>  [
  { role: 'system', content: BASIC_INSTRUCTIONS + '\nBackground\n' + conversation.background + '\nNotes\n' + conversation.notes },
  // taking only messages from the last 24 hours
  ...conversation.messages
    .filter(message => Date.now() - new Date(message.datetime).valueOf() < 4 * 60 * 60 * 1000)
    .map(message => ({ role: message.role, content: message.content })),
  { role: 'user', content: input }
]

const tools = async (conversation, logger) => {
  const tools = []
  for (const provider of toolProviderss) {
    const providerTools = await provider(conversation, logger)
    tools.push(...providerTools)
  }
  return tools
}

module.exports = { ask, tools }
