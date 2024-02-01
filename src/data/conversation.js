const Realm = require('realm')
const Whatsapp = require('./whatsapp')

const RELAM_APP_ID = process.env.REALM_APP_ID

const getRealm = () => new Realm({ id: RELAM_APP_ID, schema: [Conversation, Message] })

class Conversation extends Realm.Object {
  static schema = {
    name: 'Conversation',
    primaryKey: '_id',
    properties: {
      _id: 'int',
      number: 'string',
      messages: { type: 'list', objectType: 'Message'}
    },
  }

  static log (number, messages) {
    const realm = getRealm()
    realm.write(() => {
      const conversations = realm.objects('Conversation').filtered(`number = "${number}"`)

      if (conversations.length) {
        conversations[0].messages.push(...messages)
      } else {
        realm.create('Conversation', { number: number, messages: messages })
      }
    })

    realm.close()
  }

  static get (number) {
    const realm = getRealm()
    const conversations = realm.objects('Conversation').filtered(`number = "${number}"`)
    const conversation = conversations.length ? conversations[0] : realm.create('Conversation', { number, messages: [] })
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
        conversation.messages.push({ role: 'user', content: input }, { role: 'assistant', content: output })
      })
      realm.close()
    })
  }
 }

class Message extends Realm.Object {
  static schema = {
    name: 'Message',
    primaryKey: '-_id',
    properties: {
      _id: 'int',
      content: 'string',
      role: 'string'
    }
  }
}