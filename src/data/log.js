const { collection } = require('./database')

class LogEntry {
  constructor (props) {
    Object.assign(this, props)
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

  static async load (query = {}) {
    const logs = await collection('Logs')
    const entries = await logs.find(query)
    return entries.map(entry => new LogEntry(entry))
  }
}

class Logger {
  constructor (generalMeta = {}) {
    this.generalMeta = generalMeta
  }
  
  async log (level, message, meta = {}) {
    const logs = await collection('Logs')
    const entry = new LogEntry({ level, message, meta: { ...this.generalMeta, ...meta }, timestamp: new Date(), id: Math.random().toString(36).substring(7)})
    console.log(JSON.stringify(entry.toJSON()))
    await logs.insertOne(entry.toJSON())
  }

  async debug (message, meta = {}) {
    await this.log('debug', message, meta)
  }

  async info (message, meta = {}) {
    await this.log('info', message, meta)
  }

  async warn (message, meta = {}) {
    await this.log('warn', message, meta)
  }

  async error (message, meta = {}) {
    await this.log('error', message, meta)
  }

  async fatal (message, meta = {}) {
    await this.log('fatal', message, meta)
  }
}

Logger.LogEntry = LogEntry

module.exports = Logger
