import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { format, startOfWeek, startOfMonth, startOfQuarter } from 'date-fns'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'

interface AppointmentRow {
  id: string
  dateTime: Date
  status: 'scheduled' | 'completed' | 'no_show'
}

type ViewKey = 'weekly' | 'monthly' | 'quarterly' | 'cancellations'

export default function Analytics() {
  const { user } = useAuth()
  const [rows, setRows] = useState<AppointmentRow[]>([])
  const [view, setView] = useState<ViewKey>('weekly')

  useEffect(() => {
    if (!user) return
    const since = new Date()
    since.setFullYear(since.getFullYear() - 1) // last 12 months
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      where('dateTime', '>=', since),
      orderBy('dateTime', 'asc'),
    )
    const unsub = onSnapshot(q, snap => {
      const data: AppointmentRow[] = snap.docs.map(d => {
        const x = d.data() as any
        const dt = new Date(x.dateTime?.toDate?.() || x.dateTime)
        return { id: d.id, dateTime: dt, status: x.status }
      })
      setRows(data)
    })
    return () => unsub()
  }, [user])

  const weeklyData = useMemo(() => {
    const m = new Map<string, number>()
    rows.forEach(r => {
      const key = format(startOfWeek(r.dateTime, { weekStartsOn: 1 }), 'yyyy-ww')
      m.set(key, (m.get(key) || 0) + 1)
    })
    return Array.from(m.entries()).map(([k, v]) => ({ name: k, total: v }))
  }, [rows])

  const monthlyData = useMemo(() => {
    const m = new Map<string, number>()
    rows.forEach(r => {
      const key = format(startOfMonth(r.dateTime), 'yyyy-MM')
      m.set(key, (m.get(key) || 0) + 1)
    })
    return Array.from(m.entries()).map(([k, v]) => ({ name: k, total: v }))
  }, [rows])

  const quarterlyData = useMemo(() => {
    const m = new Map<string, number>()
    rows.forEach(r => {
      const key = format(startOfQuarter(r.dateTime), "yyyy-'Q'Q")
      m.set(key, (m.get(key) || 0) + 1)
    })
    return Array.from(m.entries()).map(([k, v]) => ({ name: k, total: v }))
  }, [rows])

  const cancellationData = useMemo(() => {
    const m = new Map<string, number>()
    rows.filter(r => r.status === 'no_show').forEach(r => {
      const key = format(startOfMonth(r.dateTime), 'yyyy-MM')
      m.set(key, (m.get(key) || 0) + 1)
    })
    return Array.from(m.entries()).map(([k, v]) => ({ name: k, total: v }))
  }, [rows])

  return (
    <section className="grid gap-6 md:grid-cols-5">
      {/* Local analytics sidebar */}
      <aside className="rounded-2xl border border-white/10 bg-white/5 p-3 md:col-span-1">
        <h2 className="mb-3 text-lg font-semibold text-gray-100">Analitice</h2>
        <nav className="flex flex-col gap-2">
          <button className={`btn-ghost justify-start ${view === 'weekly' ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={() => setView('weekly')}>Pacienți pe săptămână</button>
          <button className={`btn-ghost justify-start ${view === 'monthly' ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={() => setView('monthly')}>Pacienți pe lună</button>
          <button className={`btn-ghost justify-start ${view === 'quarterly' ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={() => setView('quarterly')}>Pacienți pe trimestru</button>
          <button className={`btn-ghost justify-start ${view === 'cancellations' ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={() => setView('cancellations')}>Anulări (no-show)</button>
        </nav>
      </aside>

      {/* Charts area */}
      <div className="md:col-span-4">
        {view === 'weekly' && (
          <div className="card">
            <h3 className="mb-3 text-lg font-semibold text-gray-100">Pacienți pe săptămână</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <LineChart data={weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                  <XAxis dataKey="name" stroke="#e5e7eb" tick={{ fill: '#e5e7eb' }} />
                  <YAxis stroke="#e5e7eb" tick={{ fill: '#e5e7eb' }} />
                  <Tooltip contentStyle={{ background: '#2f3242', border: '1px solid #ffffff22', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#9e85b0" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === 'monthly' && (
          <div className="card">
            <h3 className="mb-3 text-lg font-semibold text-gray-100">Pacienți pe lună</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                  <XAxis dataKey="name" stroke="#e5e7eb" tick={{ fill: '#e5e7eb' }} />
                  <YAxis stroke="#e5e7eb" tick={{ fill: '#e5e7eb' }} />
                  <Tooltip contentStyle={{ background: '#2f3242', border: '1px solid #ffffff22', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="total" fill="#9479a8" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === 'quarterly' && (
          <div className="card">
            <h3 className="mb-3 text-lg font-semibold text-gray-100">Pacienți pe trimestru</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={quarterlyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                  <XAxis dataKey="name" stroke="#e5e7eb" tick={{ fill: '#e5e7eb' }} />
                  <YAxis stroke="#e5e7eb" tick={{ fill: '#e5e7eb' }} />
                  <Tooltip contentStyle={{ background: '#2f3242', border: '1px solid #ffffff22', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="total" fill="#10B981" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {view === 'cancellations' && (
          <div className="card">
            <h3 className="mb-3 text-lg font-semibold text-gray-100">Anulări (no-show) pe lună</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <LineChart data={cancellationData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                  <XAxis dataKey="name" stroke="#e5e7eb" tick={{ fill: '#e5e7eb' }} />
                  <YAxis stroke="#e5e7eb" tick={{ fill: '#e5e7eb' }} />
                  <Tooltip contentStyle={{ background: '#2f3242', border: '1px solid #ffffff22', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}