const { action } = require('../apis/google')
const { functionTool, safely } = require('./_utils')

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

module.exports = async (_conversation, logger) => {
  const calendarNames = await action('get_calendar_names').then(calendars => calendars.map(calendar => calendar.name))

  return [
    functionTool(async function get_calendar_events(params) {
      return await safely(async () => {
        // If the start date and end date are the same, the user wants to see the events of that day. Add one day to the end date to include the events of that day
        if (params.startDate && params.endDate && params.startDate === params.endDate) {
          const endDate = new Date(params.endDate)
          endDate.setDate(endDate.getDate() + 1)
          params.endDate = endDate.toISOString().split('T')[0]
        }
        await logger.debug('Reading events from calendar', params)
        const events = await action('get_calendar_events', params)
        events.forEach(event => {
          event.category = COLORS_CODING[event.color]
          event.start = new Date(event.start)
          event.end = new Date(event.end)
        })
        await logger.debug('Events read')
        return events
      }, logger)
    }, { startDate: { type: 'string' }, endDate: { type: 'string' } }),
    functionTool(async function add_calendar_event(params) {
      return await safely(async () => {
        await logger.debug('Adding event to calendar', params)
        params.color = Object.entries(COLORS_CODING).find(([_, category]) => category === params.category)[0]
        await action('add_calendar_event', params)
        await logger.debug('Event added')
        return 'Event added'
      }, logger)
    }, { calendarName: { type: 'string', enum: calendarNames }, title: { type: 'string' }, startDate: { type: 'string' }, endDate: { type: 'string' }, description: { type: 'string' }, allDay: { type: 'boolean' }, category: { type: 'string', enum: Object.values(COLORS_CODING) } })
  ]
}