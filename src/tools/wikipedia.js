const wiki = require('wikipedia')
const { functionTool } = require('./_utils')

const tools = async (_conversation, logger) => [
  functionTool(async function get_info_from_wikipedia (params) {
    await logger.debug('Searching wikipedia for ' + params.topic)
    const page = await wiki.page(params.topic)
    if (!page) return 'Page not found'
    const summary = await page.summary()
    return { summary: summary.extract, link: summary.content_urls.desktop.page }
  }, { topic: { type: 'string' } })
]

module.exports = tools
