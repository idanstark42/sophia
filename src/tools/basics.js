const Logger = require('../data/log')

const LEVELS = {
  warn: { weight: 1 },
  error: { weight: 5 },
  fatal: { weight: 20 }
}

const tools = (conversation, logger) => [
  {
    type: 'function',
    function: {
      function: async function diagnose_self () {
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
        const logs = await Object.keys(LEVELS).reduce(async (obj, level) => {
          const logs = await Logger.LogEntry.load({ level, timestamp: { $gte: twentyFourHoursAgo } })
          return { ...obj, [level]: logs.length }
        }, {})
        // grade the health of the assistant from 1 to 100 based on the amount of fatals, errors and warnings
        return Math.max(Object.entries(LEVELS).reduce((grade, [level, { weight }]) => grade - logs[level] * weight, 100), 0)
      }
    }
  }, {
    type: 'function',
    function: function tell_time () {
      return new Date().toLocaleTimeString()
    }
  }, {
    type: 'function',
    function: function tell_date () {
      return new Date().toLocaleDateString()
    }
  }, {
    type: 'function',
    function: function tell_datetime () {
      return new Date().toLocaleString()
    }
  }, {
    type: 'function',
    function: function tell_day () {
      return new Date().toLocaleDateString('en-US', { weekday: 'long' })
    }
  }
]

module.exports = tools