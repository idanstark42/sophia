const Logger = require('./data/log')

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
        const logs = await Object.keys(LEVELS).reduce(async (obj, level) => {
          const logs = await Logger.LogEntry.load({ level, timestamp: { $gte: new Date().valueOf() - 24 * 60 * 60 * 1000 } })
          return { ...obj, [level]: logs.length }
        }, {})
        // grade the health of the assistant from 1 to 100 based on the amount of fatals, errors and warnings
        return Math.max(Object.entries(LEVELS).reduce((grade, [level, { weight }]) => grade - logs[level] * weight, 100), 0)
      }
    }
  }
]