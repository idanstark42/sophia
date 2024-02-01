const Realm = require('realm')
const Whatsapp = require('../whatsapp')

const RELAM_APP_ID = process.env.REALM_APP_ID

const getRealm = () => new Realm({ id: RELAM_APP_ID, schema: [Conversation, Message] })
const generateId = () => Math.floor(Math.random() * 1000000000).toString()

class Conversation extends Realm.Object {
  static schema = {
    name: 'Conversation',
    primaryKey: 'string',
    properties: {
      number: 'string',
      messages: { type: 'list', objectType: 'Message' }
    },
  }

  static get (number) {
    let conversation
    const realm = getRealm()
    realm.write(() => {
      const conversations = realm.objects('Conversation').filtered(`number = "${number}"`)
      conversation = conversations.length ? conversations[0] : realm.create('Conversation', { number, messages: [] })
    })
    realm.close()
    return conversation
  }

  respond (input, output) {
    const conversation = this
    const number = this.number
    const whatsapp = new Whatsapp(number)
    return whatsapp.send(output).then(() => {
      const realm = getRealm()
      realm.write(() => {
        conversation.messages.push({ _id: generateId(), role: 'user', content: input }, { _id: generateId(), role: 'assistant', content: output })
      })
      realm.close()
    })
  }
 }

class Message extends Realm.Object {
  static schema = {
    name: 'Message',
    properties: {
      _id: 'string',
      content: 'string',
      role: 'string'
    }
  }
}

module.exports = Conversation