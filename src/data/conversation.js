const Realm = require('realm')
const Whatsapp = require('../whatsapp')

const REALM_APP_ID = process.env.REALM_APP_ID

class Conversation {
  static async get (number) {
    const database = await init()
    const conversations = database.collection('Conversations')
    const conversation = await conversations.findOne({ number }) || await conversations.insertOne({ number, messages: [], notes: '' })
    return new Conversation(conversation)
  }

  constructor (props) {
    this.number = props.number
    this.messages = props.messages
    this.notes = props.notes
    this.whatsapp = new Whatsapp(this.number)
  }

  async markRead (messageId) {
    await this.whatsapp.markRead(messageId)
  }

  async respond (input, output) {
    await this.whatsapp.send(output)
    const database = await init()
    const conversations = database.collection('Conversations')
    await conversations.updateOne({ number: this.number }, { $push: { messages: { $each: [{ role: 'user', content: input }, { role: 'assistant', content: output }] } } })
  }

  async takeNote (note) {
    const database = await init()
    const conversations = database.collection('Conversations')
    const notes = this.notes + '\n' + note
    await conversations.updateOne({ number: this.number }, { $set: { notes } })
  }

  static tools (conversation) {
    return [
      {
        type: 'function',
        function: {
          function: function take_note (note) { console.log('taking note: "' + note + '"'); conversation.takeNote(note) },
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

const init = async () => {
  const app = new Realm.App({ id: REALM_APP_ID })
  await app.logIn(Realm.Credentials.anonymous())
  return app.currentUser.mongoClient('mongodb-atlas').db('Sophia')
}

module.exports = Conversation