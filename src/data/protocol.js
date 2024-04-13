const { collection } = require('./database')

class Conversation {
  constructor (props) {
    this.name = props.name
    this.commands = props.commands
  }

  execute () {
    
  }

  static async get (name) {
    const protocols = await collection('Protocols')
    const protocol = await protocols.findOne({ name, archived: { $ne: true } })
    return new Protocol(protocol)
  }

  static tools (conversation, logger) {
    return [
      {
        type: 'function',
        function: {
          function: async function take_note (params) {
            await conversation.takeNote(params.note, logger)
          },
          parse: JSON.parse,
          parameters: {
            type: 'object',
            properties: {
              note: { type: 'string' }
            }
          }
        }
      }
    ]
  
  }
}

module.exports = Conversation