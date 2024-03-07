const { google } = require('../apis/google')
const { functionTool } = require('./_utils')

const ACTIONS = {
  get_calendar_events: { startDate: { type: 'date' }, endDate: { type: 'date' } },
  add_calendar_event: { title: { type: 'string' }, startDate: { type: 'date' }, endDate: { type: 'date' }, description: { type: 'string' }, allDay: { type: 'boolean' } },
}

module.exports = (_conversation, logger) => Object.entries(ACTIONS).map(([action, paramsDefinition]) => functionTool(async function (params) {
  await logger.debug('Calling google action', { action, params })
  return await google.action(action, params)
}, paramsDefinition))
