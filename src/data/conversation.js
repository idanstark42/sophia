const Whatsapp = require('../whatsapp')
const { collection } = require('./database')

class Conversation {
  constructor (props) {
    this.number = props.number
    this.messages = props.messages
    this.notes = props.notes
    this.background = props.background
    this.whatsapp = new Whatsapp(this.number)
  }

  async markRead (message, logger) {
    await logger.info('Marking message as read: ' + message.id)
    await this.whatsapp.markRead(message.id, logger)
    const conversations = await collection('Conversations')
    await conversations.updateOne({ number: this.number }, { $push: { messages: { $each: [{ role: 'user', content: message.text.body, id: message.id, datetime: new Date() }] } } })
  }

  async send (message, logger) {
    await logger.info('Sending message: ' + message)
    await this.whatsapp.send(message, logger)
    const conversations = await collection('Conversations')
    await conversations.updateOne({ number: this.number }, { $push: { messages: { $each: [{ role: 'assistant', content: message, datetime: new Date() }] } } })
  }

  async takeNote (note, logger) {
    await logger.info('Taking note: ' + note)
    const conversations = await collection('Conversations')
    const notes = this.notes + '\n' + note
    await conversations.updateOne({ number: this.number }, { $set: { notes } })
  }

  static async get (number) {
    const conversations = await collection('Conversations')
    const conversation = await conversations.findOne({ number, archived: { $ne: true } }) || await conversations.insertOne({ number, messages: [], background: '', notes: '', archived: false })
    return new Conversation(conversation)
  }

  static async exists (messageId) {
    const conversations = await collection('Conversations')
    const conversation = await conversations.findOne({ 'messages.id': messageId })
    return conversation !== null
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