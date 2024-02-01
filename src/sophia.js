const OpenAI = require('openai')

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
`

const ask = async (input, conversation) => {
  const model = process.env.OPENAI_MODEL
  const messages = [{ role: 'system', content: BASIC_INSTRUCTIONS + '\nNotes\n' + conversation.notes }, ...conversation.messages.slice(-100), { role: 'user', content: input }]
  return await new OpenAI().beta.chat.completions
    .runTools({ model, messages, tools: tools.concat(conversation.tools) })
    .finalContent()
}

const sophia = { ask }

module.exports = sophia
