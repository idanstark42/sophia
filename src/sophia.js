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
You are a friend to everyone.`

const ask = async (input, { history, output, error }) => {
  const model = process.env.OPENAI_MODEL
  const messages = [{ role: 'system', content: BASIC_INSTRUCTIONS }, ...history, { role: 'user', content: input }]
  try {
    const response = await new OpenAI().beta.chat.completions
      .runTools({ model, messages, tools })
      .on('message', message => console.log(message))
      .finalContent()
    output(response)
  } catch (e) {
    error(e)
    throw e
  }
}

const sophia = { ask }

module.exports = sophia
