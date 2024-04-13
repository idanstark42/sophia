const { collection } = require('./database')
const { safely, functionTool } = require('../tools/_utils')

class Conversation {
  constructor (props) {
    this.name = props.name
    this.commands = props.commands
  }

  execute (conversation, logger) {
    // TODO: Implement protocol execution
  }

  static async get (name) {
    const protocols = await collection('Protocols')
    const protocol = await protocols.findOne({ name, archived: { $ne: true } })
    return new Protocol(protocol)
  }

  static tools (conversation, logger) {
    return [
      functionTool(async function find_protocol (params) {
        return await safely(async () => {
          const protocol = await Protocol.get(params.protocol)
          if (!protocol) throw new Error('Protocol not found')
          return protocol
        }, logger)
      }, { protocol: { type: 'string' } }),
      functionTool(async function execute_protocol (params) {
        return await safely(async () => {
          await logger.debug('Executing protocol', params)
          const protocol = await Protocol.get(params.protocol)
          if (!protocol) throw new Error('Protocol not found')
          await protocol.execute(conversation, logger)
          await logger.debug('Protocol executed')
          return 'Protocol executed'
        }, logger)
      }, { protocol: { type: 'string' } })
    ]
  
  }
}

module.exports = Conversation