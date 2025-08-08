import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns'

export type SimpleEvent = { start: Date; status?: 'scheduled' | 'completed' | 'no_show' }

function getStatusColor(status?: string) {
  if (status === 'completed') return 'bg-emerald-400'
  if (status === 'no_show') return 'bg-red-400'
  return 'bg-[var(--medflow-primary)]'
}

export default function MultiMonthOverview({ months = 3, startDate = new Date(), events = [] as SimpleEvent[] }: { months?: number; startDate?: Date; events?: SimpleEvent[] }) {
  const monthStarts = Array.from({ length: months }).map((_, i) => startOfMonth(addMonths(startDate, i)))

  // Index events by yyyy-MM-dd for quick lookups
  const dateKey = (d: Date) => format(d, 'yyyy-MM-dd')
  const eventMap = new Map<string, SimpleEvent[]>()
  for (const ev of events) {
    const k = dateKey(ev.start)
    const arr = eventMap.get(k) || []
    arr.push(ev)
    eventMap.set(k, arr)
  }

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-lg font-semibold text-gray-100">Panoramă {months} luni</h3>
      <div className={`grid gap-4 ${months <= 3 ? 'md:grid-cols-3' : months <= 6 ? 'md:grid-cols-3' : 'md:grid-cols-4'} grid-cols-1`}>
        {monthStarts.map((m, idx) => {
          const days = eachDayOfInterval({ start: startOfMonth(m), end: endOfMonth(m) })
          const firstWeekday = startOfMonth(m).getDay() || 7 // make Monday=1..Sunday=7
          const pads = Array.from({ length: (firstWeekday + 6) % 7 }) // number of leading blanks to align Monday-first

          return (
            <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 text-center font-medium text-gray-100">{format(m, 'LLLL yyyy', { locale: undefined })}</div>
              <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-300">
                {['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'].map((wd) => (
                  <div key={wd} className="px-1 py-1 text-center">{wd}</div>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1 text-sm">
                {pads.map((_, i) => (
                  <div key={`pad-${i}`} className="h-8 rounded" />
                ))}
                {days.map((d) => {
                  const k = dateKey(d)
                  const todaysEvents = eventMap.get(k) || []
                  return (
                    <div key={k} className="h-8 rounded border border-white/5 bg-white/5 px-1 py-1 text-center text-[12px] text-gray-200">
                      <div className="leading-none">{format(d, 'd')}</div>
                      <div className="mt-0.5 flex justify-center gap-0.5">
                        {todaysEvents.slice(0, 3).map((ev, i) => (
                          <span key={i} className={`inline-block h-1.5 w-1.5 rounded-full ${getStatusColor(ev.status)}`} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}