const { action } = require('../apis/google')
const { functionTool } = require('./_utils')

// The meaning of the colors in the calendar
const COLORS_CODING = {
  tomato: 'volunteering',
  tangerine: 'exceptional',
  banana: 'work',
  basil: 'date',
  peacock: 'learning',
  blueberry: 'general',
  grape: 'social',
  flamingo: 'family',
  graphite: 'financial'
}

const getActions = async () => {
  const calendarNames = await action('get_calendar_names').then(calendars => calendars.map(calendar => calendar.name))

  return {
    get_calendar_events: {
      params: { startDate: { type: 'date' }, endDate: { type: 'date' } },
      postProcessing: events => {
        events.forEach(event => {
          event.category = COLORS_CODING[event.color]
          event.start = new Date(event.start)
          event.end = new Date(event.end)
        })
        return events
      }
    },
    add_calendar_event: {
      params: { calendarName: { type: 'string', enum: calendarNames }, title: { type: 'string' }, startDate: { type: 'date' }, endDate: { type: 'date' }, description: { type: 'string' }, allDay: { type: 'boolean' }, category: { type: 'string', enum: Object.values(COLORS_CODING) } },
      preProcessing: params => {
        params.start = params.startDate
        params.end = params.endDate
        delete params.startDate
        delete params.endDate
        params.color = Object.entries(COLORS_CODING).find(([_, category]) => category === params.category)[0]
        return params
      }
    },
  }
}

module.exports = async (_conversation, logger) => {
  const actions = await getActions()
  return Object.entries(actions).map(([action, actionDefinition]) => functionTool(async function (params) {
    await logger.debug('Calling google action', { action, params })
    if (actionDefinition.preProcessing) params = actions[action].preProcessing(params)
    const response = await google.action(action, params)
    await logger.debug('Google action response', { action, response })
    if (actionDefinition.postProcessing) return actions[action].postProcessing(response)
    return response
  }, actionDefinition.params))
}
