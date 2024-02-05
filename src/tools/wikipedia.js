const wiki = require('wikipedia')

const tools = (_conversation, logger) => [
  {
    type: 'function',
    function: {
      function: async function lookup_in_wikipedia (params) {
        await logger.debug('Searching wikipedia for ' + params.topic)
        const page = await wiki.page(params.topic)
        return await page.content()
      },
      parse: JSON.parse,
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string' }
        }
      }
    }
  }
]

module.exports = tools
