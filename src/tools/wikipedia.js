const wiki = require('wikipedia')

const tools = (_conversation, logger) => [
  {
    type: 'function',
    function: {
      function: async function get_info_from_wikipedia (params) {
        await logger.debug('Searching wikipedia for ' + params.topic)
        const page = await wiki.page(params.topic)
        const summary = await page.summary()
        return { summary: summary.extract, link: summary.content_urls.desktop.page }
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
