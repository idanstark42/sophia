function respondJSON (data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)
}

function ping () {
  const response = { active: true, version: '1.0', timestamp: Date.now() }
  return respondJSON(response)
}

function get_calendar_names () {
  const calendars = CalendarApp.getAllCalendars()
  const response = calendars.map(calendar => ({ name: calendar.getName() }))
  return respondJSON(response)
}

function get_calendar_events ({ start, end }) {
  const calendars = CalendarApp.getAllCalendars()
  const events = calendars.flatMap(calendar => calendar.getEvents(new Date(start), new Date(end)))
  const response = events.map(event => ({
    id: event.getId(),
    title: event.getTitle(),
    description: event.getDescription(),
    location: event.getLocation(),
    start: event.getStartTime(),
    end: event.getEndTime(),
    allDay: event.isAllDayEvent(),
    calendar: event.getOriginalCalendar().getName(),
    color: event.getColor(),
  }))
  return respondJSON(response)
}

function add_calendar_event ({ calendarName, title, description, location, start, end, allDay }) {
  const calendar = CalendarApp.getCalendarsByName(calendarName)[0]
  if (!calendar) return respondJSON({ error: 'Calendar not found' })

  const event = calendar.createEvent(title, new Date(start), new Date(end), { description, location, allDay })
  return respondJSON({ id: event.getId() })
}

const actions = { ping, get_calendar_names, get_calendar_events, add_calendar_event }

function doGet (request) {
  const { action, ...params } = request.parameter
  return actions[action](params)
}