const Trello = require('node-trello')
const promisify = require('util').promisify

const { functionTool, safely } = require('./_utils')

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

const listFromName = async (listKey) => {
  const { listName, boardName } = LISTS[listKey]

  const board = await get('/1/members/me/boards')
    .then(boards => boards.find(board => board.name === boardName))

  if (!board) throw new Error('Board not found')

  const list = await get(`/1/boards/${board.id}/lists`)
    .then(lists => lists.find(list => list.name === listName))

  if (!list) throw new Error('List not found')

  return list
}

const addLabels = async (card, labels) => {
  for (const label of labels) {
    await post(`/1/cards/${card.id}/idLabels`, { value: label })
  }
}

const removeLabels = async (card, labels) => {
  for (const label of labels) {
    await post(`/1/cards/${card.id}/idLabels/${label.id}`, { value: '' })
  }
}

const addChecklist = async (card, checklist) => {
  const newChecklist = await post(`/1/cards/${card.id}/checklists`, { name: checklist.name })
  for (const item of checklist.items) {
    await post(`/1/checklists/${newChecklist.id}/checkItems`, { name: item.name, state: item.state })
  }
}

const removeChecklist = async (card, checklist) => {
  const currentChecklists = await get(`/1/cards/${card.id}/checklists`)
  for (const checklist of currentChecklists) {
    await post(`/1/checklists/${checklist.id}/name`, { value: '' })
  }
}

const checkItem = async (checklist, item) => {
  await post(`/1/checklists/${checklist.id}/checkItems/${item.id}`, { state: 'complete' })
}

const uncheckItem = async (checklist, item) => {
  await post(`/1/checklists/${checklist.id}/checkItems/${item.id}`, { state: 'incomplete' })
}

module.exports = (_conversation, logger) => [
  functionTool(async function read_list_tasks(params) {
    await safely(async () => {
      const list = await listFromName(params.list)
      const cards = await get(`/1/lists/${list.id}/cards`)
      for (const card of cards) {
        const checklists = await get(`/1/cards/${card.id}/checklists`)
        card.checklists = checklists.map(checklist => ({ name: checklist.name, items: checklist.checkItems.map(({ id, name, state }) => ({ id, name, state }))}))
      }
      await logger.debug('Tasks read in list ' + params.list)
      return cards.map(({ id, name, comments, due, labels, checklists }) => ({ id, name, comments, due, labels: labels.map(label => label.name), checklists }))
    }, logger)
  }, { list: { type: 'string', enum: Object.keys(LISTS) } }),
  
  functionTool(async function create_task(params) {
    await safely(async () => {
      const list = await listFromName(params.list)
      const card = await post('/1/cards', { idList: list.id, name: params.name, due: params.due })
      if (params.labels) await addLabels(card, params.labels)
      if (params.checklists) {
        for (const checklist of params.checklists) {
          await addChecklist(card, checklist)
        }
      }
      await logger.debug('Task created')
      return 'Task created'
    }, logger)
  }, { list: { type: 'string', enum: Object.keys(LISTS) }, name: { type: 'string' }, due: { type: 'string' }, labels: { type: 'array', items: { type: 'string' } }, checklists: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, state: { type: 'string' } } } } } } } }),

  functionTool(async function move_task(params) {
    return await safely(async () => {
      const list = await listFromName(params.targetList)
      await post(`/1/cards/${params.id}/idList`, { value: list.id })
      await logger.debug('Task moved')
      return 'Task moved'
    }, logger)
  }, { id: { type: 'string' }, targetList: { type: 'string', enum: Object.keys(LISTS) } }),

  functionTool(async function update_task(params) {
    return await safely(async () => {
      const card = await get(`/1/cards/${params.id}`)
      if (params.name) await post(`/1/cards/${card.id}/name`, { value: params.name })
      if (params.due) await post(`/1/cards/${card.id}/due`, { value: params.due })
      if (params.labels) {
        const currentLabels = await get(`/1/cards/${card.id}/labels`)
        const labelsToRemove = currentLabels.filter(label => !params.labels.includes(label.name))
        const labelsToAdd = params.labels.filter(label => !currentLabels.map(label => label.name).includes(label))
        await addLabels(card, labelsToAdd)
        await removeLabels(card, labelsToRemove)
      }
      await logger.debug('Task updated')
      return 'Task updated'
    }, logger)
  }, { id: { type: 'string' }, name: { type: 'string' }, due: { type: 'string' }, labels: { type: 'array', items: { type: 'string' } } }),

  functionTool(async function add_checklist(params) {
    return await safely(async () => {
      await addChecklist(await get(`/1/cards/${params.id}`), params.checklist)
      await logger.debug('Checklist added')
      return 'Checklist added'
    }, logger)
  }, { id: { type: 'string' }, checklist: { type: 'object', properties: { name: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, state: { type: 'string' } } } } } } }),

  functionTool(async function remove_checklist(params) {
    return await safely(async () => {
      await removeChecklist(await get(`/1/cards/${params.id}`), params.checklist)
      await logger.debug('Checklist removed')
      return 'Checklist removed'
    }, logger)
  }, { id: { type: 'string' }, checklist: { type: 'object', properties: { name: { type: 'string' } } } }),

  functionTool(async function set_checklist_item_status(params) {
    return await safely(async () => {
      const checklist = await get(`/1/cards/${params.id}`).checklists.find(checklist => checklist.name === params.checklist)
      const item = checklist.items.find(item => item.name === params.item)
      if (params.state === 'complete')    await checkItem(checklist, item)
      else                                await uncheckItem(checklist, item)
      await logger.debug('Checklist item status set', params.state)
      return 'Checklist item status set' + params.state
    }, logger)
  }, { id: { type: 'string' }, checklist: { type: 'string' }, item: { type: 'string' }, state: { type: 'string', enum: ['complete', 'incomplete']} })
]
