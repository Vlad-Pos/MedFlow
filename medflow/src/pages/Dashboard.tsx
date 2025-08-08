import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { dateFnsLocalizer } from 'react-big-calendar'
import type { Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, endOfWeek } from 'date-fns'
import { ro } from 'date-fns/locale'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { Link, useNavigate } from 'react-router-dom'
import EventCard from '../components/EventCard'
import MultiMonthOverview from '../components/MultiMonthOverview'
import { isDemoMode } from '../utils/env'
import LoadingSpinner from '../components/LoadingSpinner'

const WeeklyCalendar = lazy(() => import('../components/WeeklyCalendar'))

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
  const [monthsOverview, setMonthsOverview] = useState<3 | 6 | 12>(3)
  const navigate = useNavigate()

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekLabel = `${weekStart.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}–${weekEnd.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}`

  useEffect(() => {
    if (!user) return
    const start = startOfWeek(new Date(), { weekStartsOn: 1 })
    const end = new Date(start)
    end.setDate(end.getDate() + 60)

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

  const handleSelectEvent = useMemo(() => (e: CalendarEvent) => navigate(`/appointments?edit=${e.id}`), [navigate])
  const handleSelectSlot = useMemo(() => (slot: any) => {
    const start = slot.start as Date
    const iso = new Date(start.getTime() - start.getTimezoneOffset()*60000).toISOString().slice(0,16)
    navigate(`/appointments?new=${encodeURIComponent(iso)}`)
  }, [navigate])

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-gray-100">Program săptămânal</h2>
          <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-gray-200">Săptămâna: {weekLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          {isDemoMode() && <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-200">Mod demo - date de exemplu</span>}
          <Link className="btn-primary" to="/appointments">Gestionează programările</Link>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-4 text-sm text-gray-200">
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[var(--medflow-primary)]" /> Programat</div>
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Finalizat</div>
        <div className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-red-500" /> Nu s-a prezentat</div>
      </div>

      <div className="card" aria-label="Calendar programări">
        <Suspense fallback={<div className="py-12"><LoadingSpinner label="Se încarcă calendarul..." /></div>}>
          <WeeklyCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            eventPropGetter={eventPropGetter}
            components={components()}
          />
        </Suspense>
      </div>

      {events.length === 0 && (
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-200">Nu există evenimente pentru această săptămână. Selectați un interval în calendar pentru a crea o programare.</div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-100">Panoramă multi-lună</h3>
        <div className="flex gap-2" role="group" aria-label="Selectare număr luni">
          {[3,6,12].map(v => (
            <button key={v} className={`btn-ghost ${monthsOverview === v ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={() => setMonthsOverview(v as 3|6|12)}>{v} luni</button>
          ))}
        </div>
      </div>
      <MultiMonthOverview
        months={monthsOverview}
        events={events.map(e => ({ start: e.start, status: e.status }))}
      />

      <button className="btn-primary fixed bottom-6 right-6" onClick={() => navigate('/appointments')}>+ Programare nouă</button>
    </section>
  )
}