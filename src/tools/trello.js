const Trello = require('node-trello')
const promisify = require('util').promisify

const { functionTool } = require('../tools/utils')

const TRELLO_API_KEY = process.env.TRELLO_API_KEY
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN

const trello = new Trello(TRELLO_API_KEY, TRELLO_API_TOKEN)
const get = promisify(trello.get.bind(trello))
const post = promisify(trello.post.bind(trello))

const LISTS = {
  ideas: { boardName: 'Long Term Projects', listName: 'IDEAS' },
  yearly: { boardName: 'Tactical Tasks', listName: 'TODO (year)' },
  monthly: { boardName: 'Tactical Tasks', listName: 'COMING UP (month)' },
  weekly: { boardName: 'Tactical Tasks', listName: 'UP NEXT (week)' },
  noNow: { boardName: 'Tactical Tasks', listName: 'IN PROGRESS (not now)' },
  halted: { boardName: 'Tactical Tasks', listName: 'HALTED' }
}

module.exports = () => []

// module.exports = (_conversation, _logger) => [
//   functionTool(async function read_tasks_in_list(params) {
//     const { listName, boardName } = LISTS[params.list]

//     const board = await get('/1/members/me/boards')
//       .then(boards => boards.find(board => board.name === boardName))

//     if (!board) return 'Board not found'

//     const list = await get(`/1/boards/${board.id}/lists`)
//       .then(lists => lists.find(list => list.name === listName))

//     if (!list) return 'List not found'

//     const cards = await get(`/1/lists/${list.id}/cards`)

//     for (const card of cards) {
//       const checklists = await get(`/1/cards/${card.id}/checklists`)
//       card.checklists = checklists.map(checklist => ({ name: checklist.name, items: checklist.checkItems.map(({ id, name, state }) => ({ id, name, state }))}))
//     }

//     return cards.map(({ id, name, comments, due, labels, checklists }) => ({ id, name, comments, due, labels: labels.map(label => label.name), checklists }))
//   }, { list: { type: 'string', enum: Object.keys(LISTS) } }),
  
//   functionTool(async function create_task_in_list(params) {
//   }, { list: { type: 'string', enum: Object.keys(LISTS) }, name: { type: 'string' } }),

//   functionTool(async function move_task_to_list(params) {
//   }, { id: { type: 'string' }, list: { type: 'string', enum: Object.keys(LISTS) } }),

//   functionTool(async function update_task(params) {
//   }, { id: { type: 'string' }, name: { type: 'string' }, due: { type: 'string' }, labels: { type: 'array', items: { type: 'string' } }, checklists: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' }, state: { type: 'string' } } } } } } } }),

//   functionTool(async function prioritize_tasks_in_list(params) {
//   }, { list: { type: 'string', enum: Object.keys(LISTS) } })
// ]