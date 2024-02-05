const { collection } = require('./database')

class LogEntry {
  constructor (level, message, meta) {
    this.id = Math.random().toString(36).substring(7)
    this.timestamp = new Date().toISOString()
    this.level = level
    this.message = message
    this.meta = meta
  }

  toJSON () {
    return {
      _id: this.id,
      timestamp: this.timestamp,
      level: this.level,
      message: this.message,
      meta: this.meta
    }
  }
}

class Logger {
  constructor (generalMeta = {}) {
    this.generalMeta = generalMeta
  }
  
  async log (level, message, meta = {}) {
    const logs = await collection('Logs')
    await logs.insertOne(new LogEntry(level, message, { ...this.generalMeta, ...meta }).toJSON())
  }

  async debug (message, meta = {}) {
    await Logger.log('debug', message, meta)
  }

  async info (message, meta = {}) {
    await Logger.log('info', message, meta)
  }

  async warn (message, meta = {}) {
    await Logger.log('warn', message, meta)
  }

  async error (message, meta = {}) {
    await Logger.log('error', message, meta)
  }

  async fatal (message, meta = {}) {
    await Logger.log('fatal', message, meta)
  }
}

module.exports = Logger
