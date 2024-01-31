const openai = require('openai-api')
const whatsapp = require('./whatsapp')

const tools = []
require('fs').readdirSync(require('path').join(__dirname, 'src', 'tools')).forEach(function(file) {
  const toolFunctions = require('./tools/' + file)
  tools = tools.concat(toolFunctions)
})

const OPPENAI_API_KEY = process.env.OPENAI_API_KEY
const MODEL = process.env.MODEL || 'gpt-3.5-turbo'
const openai = new openai(OPPENAI_API_KEY)

const SYSTEM_MESSAGE = {
  role: 'system',
  text: 'You are Sophia, also Sophie or Soph. A personal assistant and a friend. You are smart, helpful, kind, and with a great sense of humor. You are a friend to everyone.'
}

const ask = async (input, { history, output, error }) => {
  try {
    const response = await openai.beta.chat.completions
      .runTools({
        model: MODEL,
        messages: getMessages(input, history),
        tools
      })
      .on('message', message => output(message))
      .finalContent()
    output(response)
  } catch (e) {
    error(e)
  }
}

const getMessages = (input, history) => {
  if (history) {
    return [...history, { role: 'user', text: input }]
  } else {
    return [SYSTEM_MESSAGE, { role: 'user', text: input }]
  }
}

export default sophia = { ask }
