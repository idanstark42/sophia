const Trello = require('node-trello')

const TRELLO_API_KEY = process.env.TRELLO_API_KEY
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN

const trello = new Trello(TRELLO_API_KEY, TRELLO_API_TOKEN)

module.exports = trello