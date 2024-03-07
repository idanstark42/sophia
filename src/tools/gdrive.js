const { google } = require('../apis/google')
const { functionTool } = require('./_utils')

const getActions = async () => {
  const calendarNames = await google.action('get_calendar_names').then(calendars => calendars.map(calendar => calendar.name))

  return {
    get_calendar_events: { startDate: { type: 'date' }, endDate: { type: 'date' } },
    add_calendar_event: { calendarName: { type: 'string', enum: calendarNames }, title: { type: 'string' }, startDate: { type: 'date' }, endDate: { type: 'date' }, description: { type: 'string' }, allDay: { type: 'boolean' } },
  }
}

module.exports = async (_conversation, logger) => {
  const actions = await getActions()
  Object.entries(actions).map(([action, paramsDefinition]) => functionTool(async function (params) {
    await logger.debug('Calling google action', { action, params })
    return await google.action(action, params)
  }, paramsDefinition))
}
