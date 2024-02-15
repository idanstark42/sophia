const trello = require('../apis/trello')
const { functionTool } = require('../tools/utils')

const LISTS = {
  ideas: { boardName: 'Long Term Projects', listName: 'IDEAS' },
  yearly: { boardName: 'Tactical Tasks', listName: 'TODO (year)' },
  monthly: { boardName: 'Tactical Tasks', listName: 'COMING UP (month)' },
  weekly: { boardName: 'Tactical Tasks', listName: 'UP NEXT (week)' },
  noNow: { boardName: 'Tactical Tasks', listName: 'IN PROGRESS (not now)' },
  halted: { boardName: 'Tactical Tasks', listName: 'HALTED' }
}

module.exports = (_conversation, _logger) => [
  functionTool(async function get_tasks_in_list(params) {
    const { boardName, listName } = LISTS[params.list]

    const boards = await trello.get(`/1/members/me/boards`)
    const board = boards.find(board => board.name === boardName)
    if (!board) return []

    const lists = await trello.get(`/1/boards/${board.id}/lists`)
    const list = lists.find(list => list.name === listName)
    if (!list) return []

    const cards = await trello.get(`/1/lists/${list.id}/cards`)
    return cards
  }, { list: { type: 'string', enum: Object.keys(LISTS) } }),

  functionTool(async function add_task_to_list(params) {
    const { boardName, listName } = LISTS[params.list]

    const boards = await trello.get(`/1/members/me/boards`)
    const board = boards.find(board => board.name === boardName)
    if (!board) return 'Board not found'

    const labels = await trello.get(`/1/boards/${board.id}/labels`)

    // create a new card
    const card = await trello.post(`/1/cards`, {
      idList: list.id,
      name: params.taskName,
      desc: params.description,
      due: params.dueDate,
      idLabels: labels.filter(label => params.labels.includes(label.name)).map(label => label.id),
    })

    // add checklist items
    for (const item of params.checklist) {
      await trello.post(`/1/cards/${card.id}/checklists`, {
      })
    }

  }, {
    list: { type: 'string', enum: Object.keys(LISTS) },
    taskName: { type: 'string' },
    dueDate: { type: 'string' },
    description: { type: 'string' },
    checklist: { type: 'array', items: { type: 'string' } },
    labels: { type: 'array', items: { type: 'string', enum: LABELS } }
  }),
]