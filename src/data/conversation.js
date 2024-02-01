const Realm = require('realm')
const Whatsapp = require('../whatsapp')

const REALM_APP_ID = process.env.REALM_APP_ID
const REALM_CLUSTER = process.env.REALM_CLUSTER

class Conversation {
  static async get (number) {
    const database = await init()
    const conversations = database.collection('Conversations')
    const conversation = await conversations.findOne({ number })
    return conversation || await conversations.insertOne({ number, messages: [] })
  }

  async respond (input, output) {
    const whatsapp = new Whatsapp(this.number)
    await whatsapp.send(output)
    const database = await init()
    const conversations = database.collection('Conversations')
    await conversations.updateOne({ number: this.number }, { $push: { messages: { $each: [{ role: 'user', content: input }, { role: 'assistant', content: output }] } } })
  }
}

const init = async () => {
  const app = new Realm.App({ id: REALM_APP_ID })
  const credentials = Realm.Credentials.anonymous()
  await app.logIn(credentials)
  return app.currentUser.mongoClient(REALM_CLUSTER).db('Sophia')
}

module.exports = Conversation