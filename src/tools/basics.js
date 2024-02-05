const Logger = require('../data/log')

const LEVELS = {
  warn: { weight: 1 },
  error: { weight: 5 },
  fatal: { weight: 20 }
}

const tools = (_conversation, logger) => [
  {
    type: 'function',
    function: {
      function: async function diagnose_self () {
        await logger.debug('Diagnosing self.')
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
        const logs = await Object.keys(LEVELS).reduce(async (obj, level) => {
          const logs = await Logger.LogEntry.load({ level, timestamp: { $gte: twentyFourHoursAgo } })
          return { ...obj, [level]: logs.length }
        }, {})
        // grade the health of the assistant from 1 to 100 based on the amount of fatals, errors and warnings
        const hp = Math.max(Object.entries(LEVELS).reduce((grade, [level, { weight }]) => grade - logs[level] * weight, 100), 0)
        await logger.debug('hp: ' + hp, { hp })
        return hp
      }
    }
  }, {
    type: 'function',
    function: function tell_datetime () {
      return new Date().toLocaleString()
    }
  }
]

module.exports = tools