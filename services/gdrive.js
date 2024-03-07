const CALENDAR_ID = 'primary'

function respondJSON (data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)
}

function ping () {
  const response = { active: true, version: '1.0', timestamp: Date.now() }
  return respondJSON(response)
}

function get_calendar_events ({ start, end }) {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID)
  const events = calendar.getEvents(new Date(start), new Date(end))
  const response = events.map(event => ({
    title: event.getTitle(),
    description: event.getDescription(),
    location: event.getLocation(),
    start: event.getStartTime(),
    end: event.getEndTime(),
    allDay: event.isAllDayEvent(),
  }))
  return respondJSON(response)
}

function add_calendar_event ({ title, description, location, start, end, allDay }) {
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID)
  const event = calendar.createEvent(title, new Date(start), new Date(end), { description, location, allDay })
  return respondJSON({ id: event.getId() })
}

const actions = { ping, get_calendar_events, add_calendar_event }

function doGet (request) {
  const { action, ...params } = request.parameter
  return actions[action](params)
}