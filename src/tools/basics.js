const Logger = require('../data/log')
const { functionTool } = require('./utils')

const LEVELS = {
  warn: { weight: 1 },
  error: { weight: 5 },
  fatal: { weight: 20 }
}

module.exports = (conversation, logger) => [
  functionTool(async function get_info_from_wikipedia (params) {
    await logger.debug('Diagnosing self.')
    
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    
    const logs = {}
    for (const level in LEVELS) {
      logs[level] = await Logger.LogEntry.load({ level, timestamp: { $gte: twentyFourHoursAgo }, 'meta.versionId': logger.generalMeta.versionId })
    }
    await logger.debug('logs', logs)
    
    // grade the health of the assistant from 1 to 100 based on the amount of fatals, errors and warnings
    const hp = Math.max(Object.entries(LEVELS).reduce((grade, [level, { weight }]) => grade - logs[level].length * weight, 100), 0)
    await logger.debug('hp: ' + hp, { hp })
    return hp
  }),

  functionTool(async function get_info_from_wikipedia (params) {
    await logger.debug('Searching in conversation for ' + params.query)
    return conversation.messages.filter(message => message.content.includes(params.query)).map(message => message.content)
  }, { query: { type: 'string' } }),

  functionTool(function tell_datetime() { return new Date().toLocaleString() })
]