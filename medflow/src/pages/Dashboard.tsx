import { useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import type { Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ro } from 'date-fns/locale'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { Link, useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'

const locales = { 'ro': ro }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

interface CalendarEvent extends Event {
  id: string
  start: Date
  end: Date
  status: 'scheduled' | 'completed' | 'no_show'
  patientName: string
  notes?: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    const end = new Date(start)
    end.setDate(end.getDate() + 60) // 2 months window for better month view

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      where('dateTime', '>=', start),
      where('dateTime', '<', end),
      orderBy('dateTime', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const rows: CalendarEvent[] = snap.docs.map((d) => {
        const data = d.data() as any
        const dt = new Date(data.dateTime?.toDate?.() || data.dateTime)
        return {
          id: d.id,
          title: data.patientName,
          start: dt,
          end: new Date(dt.getTime() + 30 * 60000),
          status: data.status,
          patientName: data.patientName,
          notes: data.notes || '',
          allDay: false,
        }
      })
      setEvents(rows)
    })
    return () => unsub()
  }, [user])

  const eventPropGetter = useMemo(() => (_event: CalendarEvent) => ({ style: { background: 'transparent', border: 'none', padding: 0 } }), [])

  function components() {
    return {
      event: ({ event }: { event: CalendarEvent }) => {
        const time = `${event.start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`
        return (
          <div title={`${event.patientName}\n${time}\n${event.notes || ''}`}>
            <EventCard title={event.patientName} status={event.status} time={time} />
          </div>
        )
      }
    }
  }

  function handleSelectEvent(e: CalendarEvent) { navigate(`/appointments?edit=${e.id}`) }
  function handleSelectSlot(slot: any) {
    const start = slot.start as Date
    const iso = new Date(start.getTime() - start.getTimezoneOffset()*60000).toISOString().slice(0,16)
    navigate(`/appointments?new=${encodeURIComponent(iso)}`)
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-100">Program</h2>
        <Link className="btn-primary" to="/appointments">Gestionează programările</Link>
      </div>
      <div className="card" aria-label="Calendar programări">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={Views.WEEK}
          views={[Views.DAY, Views.WEEK, Views.MONTH]}
          step={30}
          timeslots={1}
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          style={{ height: 640 }}
          eventPropGetter={eventPropGetter}
          components={components()}
          messages={{
            next: 'Următor', previous: 'Anterior', today: 'Azi', month: 'Lună', week: 'Săptămână', day: 'Zi', agenda: 'Agendă'
          }}
          toolbar
        />
      </div>
      <button className="btn-primary fixed bottom-6 right-6" onClick={() => navigate('/appointments')}>+ Programare nouă</button>
    </section>
  )
}