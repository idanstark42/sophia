const { functionTool, safely } = require('./_utils')
const { get, post, put } = require('../apis/trello')

const LISTS = {
  ideas: { boardName: 'Long Term Projects', listName: 'IDEAS' },
  yearly: { boardName: 'Tactical Tasks', listName: 'TODO (year)' },
  monthly: { boardName: 'Tactical Tasks', listName: 'COMING UP (month)' },
  weekly: { boardName: 'Tactical Tasks', listName: 'UP NEXT (week)' },
  noNow: { boardName: 'Tactical Tasks', listName: 'IN PROGRESS (not now)' },
  done: { boardName: 'Tactical Tasks', listName: 'DONE' },
  halted: { boardName: 'Tactical Tasks', listName: 'HALTED' }
}

const listFromName = async (listKey) => {
  const { listName, boardName } = LISTS[listKey]

  const board = await get('/1/members/me/boards').then(boards => boards.find(board => board.name === boardName))
  if (!board) throw new Error('Board not found')

  const list = await get(`/1/boards/${board.id}/lists`).then(lists => lists.find(list => list.name === listName))
  if (!list) throw new Error('List not found')

  return [list, boardName]
}

const boardLabels = async boardName => {
  const board = await get('/1/members/me/boards').then(boards => boards.find(board => board.name === boardName))
  if (!board) throw new Error('Board not found')

  return get(`/1/boards/${board.id}/labels`)
}

const setLabels = async (cardId, labels, boardName) => {
  if (!Array.isArray(labels)) labels = [labels]
  const selectedLabels = (await boardLabels(boardName)).filter(label => labels.includes(label.name)).map(label => label.id)
  console.log(selectedLabels)
  return await put(`/1/cards/${cardId}/idLabels`, { value: selectedLabels })
}

const addChecklist = async (cardId, checklist) => {
  const newChecklist = await post(`/1/cards/${cardId}/checklists`, { name: checklist.name })
  for (const item of checklist.items) {
    await post(`/1/checklists/${newChecklist.id}/checkItems`, { name: item.name, state: item.state })
  }
}

module.exports = async (_conversation, logger) => [
  functionTool(async function read_list_tasks(params) {
    return await safely(async () => {
      await logger.debug('Reading tasks in list', params)
      const [list] = await listFromName(params.list)
      const cards = await get(`/1/lists/${list.id}/cards`)
      for (const card of cards) {
        const checklists = await get(`/1/cards/${card.id}/checklists`)
        card.checklists = checklists.map(checklist => ({ name: checklist.name, items: checklist.checkItems.map(({ id, name, state }) => ({ id, name, state }))}))
      }
      await logger.debug('Tasks read')
      await logger.debug(cards.map(({ id, name, comments, due, labels, checklists }) => ({ id, name, comments, due, labels: labels.map(label => label.name), checklists })))
      return cards.map(({ id, name, comments, due, labels, checklists }) => ({ id, name, comments, due, labels: labels.map(label => label.name), checklists }))
    }, logger)
  }, { list: { type: 'string', enum: Object.keys(LISTS) } }),

  functionTool(async function get_task_from_name(params) {
    return await safely(async () => {
      await logger.debug('Getting task from name', params)
      const response = await get(`/1/search?query=${params.name}&modelTypes=cards`)
      const card = response.cards[0]
      if (!card) throw new Error('Task not found')
      const checklists = await get(`/1/cards/${card.id}/checklists`)
      card.checklists = checklists.map(checklist => ({ name: checklist.name, items: checklist.checkItems.map(({ id, name, state }) => ({ id, name, state }))}))
      await logger.debug('Task found')
      return { id: card.id, name: card.name, comments: card.comments, due: card.due, labels: card.labels.map(label => label.name), checklists }
    }, logger)

  }, { name: { type: 'string' } }),

  functionTool(async function get_available_labels_for_list(params){
    return await safely(async () => {
      await logger.debug('Getting labels for list', params)
      return await boardLabels(LISTS[params.list].boardName)
    }, logger)
  }, { list: { type: 'string', enum: Object.keys(LISTS) } }),
  
  functionTool(async function create_task(params) {
    return await safely(async () => {
      await logger.debug('Creating task', params)
      const [list, boardName] = await listFromName(params.list)
      const card = await post('/1/cards', { idList: list.id, name: params.task_name })
      if (params.task_labels) await setLabels(card.id, params.task_labels, boardName)
      if (params.checklists) {
        for (const checklist of params.checklists) {
          await addChecklist(card.id, checklist)
        }
      }
      await logger.debug('Task created')
      return 'Task created'
    }, logger)
  }, { list: { type: 'string', enum: Object.keys(LISTS) }, task_name: { type: 'string' }, task_labels: { type: 'array', items: { type: 'string' } }, checklists: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, state: { type: 'string' } } } } } } } }),

  functionTool(async function move_task_to_list(params) {
    return await safely(async () => {
      await logger.debug('Moving task', params)
      const [list] = await listFromName(params.move_to)
      await put(`/1/cards/${params.cardId}/idList`, { value: list.id })
      await logger.debug('Task moved')
      return 'Task moved'
    }, logger)
  }, { cardId: { type: 'string' }, move_to: { type: 'string', enum: Object.keys(LISTS) } }),

  functionTool(async function update_task(params) {
    return await safely(async () => {
      await logger.debug('Updating task', params)
      const boardId = (await get(`/1/cards/${params.cardId}`)).idBoard
      const boardName = (await get(`/1/boards/${boardId}`)).name

      if (params.hasOwnProperty('name'))    await put(`/1/cards/${params.cardId}/name`, { value: params.name })
      if (params.hasOwnProperty('due'))     await put(`/1/cards/${params.cardId}/due`, { value: params.due })
      if (params.hasOwnProperty('labels'))  await setLabels(params.cardId, params.labels, boardName)
      await logger.debug('Task updated')
      return 'Task updated'
    }, logger)
  }, { cardId: { type: 'string' }, name: { type: 'string' }, due: { type: 'string' }, labels: { type: 'array', items: { type: 'string' } } }),

  functionTool(async function add_checklist(params) {
    return await safely(async () => {
      await logger.debug('Adding checklist to task', params)
      await addChecklist(await get(`/1/cards/${params.cardId}`), params.checklist)
      await logger.debug('Checklist added')
      return 'Checklist added'
    }, logger)
  }, { cardId: { type: 'string' }, checklist: { type: 'object', properties: { name: { type: 'string' }, items: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, state: { type: 'string' } } } } } } }),

  functionTool(async function set_checklist_item_status(params) {
    return await safely(async () => {
      await logger.debug('Setting checklist item status', params)
      const checklists = await get(`/1/cards/${params.cardId}/checklists`)
      console.log(checklists)
      const checklist = checklists.find(checklist => checklist.name === params.checklistName)
      console.log(checklist)
      const item = checklist.checkItems.find(item => item.name === params.itemName)
      console.log(item)
      await put(`/1/cards/${params.cardId}/checklist/${checklist.id}/checkItem/${item.id}`, { state: params.state })
      await logger.debug('Checklist item status set', params.state)
      return 'Checklist item status set ' + params.state
    }, logger)
  }, { cardId: { type: 'string' }, checklistName: { type: 'string' }, itemName: { type: 'string' }, state: { type: 'string', enum: ['complete', 'incomplete']} })
]
