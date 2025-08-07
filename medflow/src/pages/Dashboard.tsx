import { useEffect, useMemo, useState } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import type { Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ro } from 'date-fns/locale'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { Link, useNavigate } from 'react-router-dom'

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
  status: 'scheduled' | 'completed' | 'no_show'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

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
        return {
          id: d.id,
          title: `${data.patientName} (${data.status === 'scheduled' ? 'Programat' : data.status === 'completed' ? 'Finalizat' : 'Nu s-a prezentat'})`,
          start: new Date(data.dateTime?.toDate?.() || data.dateTime),
          end: new Date(new Date(data.dateTime?.toDate?.() || data.dateTime).getTime() + 30 * 60000),
          status: data.status,
          allDay: false,
        }
      })
      setEvents(rows)
    })
    return () => unsub()
  }, [user])

  const eventPropGetter = useMemo(() => (event: CalendarEvent) => {
    let style = {}
    if (event.status === 'scheduled') style = { backgroundColor: '#3B82F6', color: 'white', borderRadius: 8, padding: 4 }
    if (event.status === 'completed') style = { backgroundColor: '#10B981', color: 'white', borderRadius: 8, padding: 4 }
    if (event.status === 'no_show') style = { backgroundColor: '#EF4444', color: 'white', borderRadius: 8, padding: 4 }
    return { style }
  }, [])

  async function handleSelectEvent(e: CalendarEvent) {
    navigate(`/appointments?edit=${e.id}`)
  }

  function handleSelectSlot(slot: any) {
    const start = slot.start as Date
    const iso = new Date(start.getTime() - start.getTimezoneOffset()*60000).toISOString().slice(0,16)
    navigate(`/appointments?new=${encodeURIComponent(iso)}`)
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Program săptămânal</h2>
        <Link className="btn-primary" to="/appointments">Gestionează programările</Link>
      </div>
      <div className="card">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['week', 'day']}
          step={30}
          timeslots={1}
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          style={{ height: 600 }}
          eventPropGetter={eventPropGetter}
          messages={{
            next: 'Următor', previous: 'Anterior', today: 'Azi', month: 'Lună', week: 'Săptămână', day: 'Zi', agenda: 'Agendă'
          }}
        />
      </div>
    </section>
  )
}