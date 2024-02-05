const Realm = require('realm')

const REALM_APP_ID = process.env.REALM_APP_ID

const collection = async name => {
  const app = new Realm.App({ id: REALM_APP_ID })
  await app.logIn(Realm.Credentials.anonymous())
  return app.currentUser
    .mongoClient('mongodb-atlas')
    .db('Sophia')
    .collection(name)
}

module.exports.collection = collection