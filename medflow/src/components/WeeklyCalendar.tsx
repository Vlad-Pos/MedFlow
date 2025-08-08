import { Calendar, Views } from 'react-big-calendar'

type Props = {
  localizer: any
  events: any[]
  startAccessor: string
  endAccessor: string
  onSelectEvent: (event: any) => void
  onSelectSlot: (slot: any) => void
  eventPropGetter?: any
  components?: any
}

export default function WeeklyCalendar({ localizer, events, startAccessor, endAccessor, onSelectEvent, onSelectSlot, eventPropGetter, components }: Props) {
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor={startAccessor}
      endAccessor={endAccessor}
      defaultView={Views.WEEK}
      views={[Views.DAY, Views.WEEK, Views.MONTH]}
      step={30}
      timeslots={1}
      selectable
      onSelectEvent={onSelectEvent}
      onSelectSlot={onSelectSlot}
      style={{ height: 640 }}
      eventPropGetter={eventPropGetter}
      components={components}
      messages={{
        next: 'Următor', previous: 'Anterior', today: 'Azi', month: 'Lună', week: 'Săptămână', day: 'Zi', agenda: 'Agendă'
      }}
      toolbar
    />
  )
}