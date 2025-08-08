import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import { differenceInDays, eachDayOfInterval, format, startOfMonth, startOfQuarter, startOfWeek } from 'date-fns'
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
import { isDemoMode } from '../utils/env'

interface AppointmentRow {
  id: string
  dateTime: Date
  status: 'scheduled' | 'completed' | 'no_show'
  createdAt?: Date
}

type ViewKey = 'weekly' | 'monthly' | 'quarterly' | 'cancellations'

const WORK_START_HOUR = 9
const WORK_END_HOUR = 17
const SLOT_MINUTES = 30

function toCsv(rows: Array<Record<string, any>>): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (val: any) => {
    const s = String(val ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"'
    }
    return s
  }
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','))
  }
  return lines.join('\n')
}

export default function Analytics() {
  const { user } = useAuth()
  const [rows, setRows] = useState<AppointmentRow[]>([])
  const [view, setView] = useState<ViewKey>('weekly')
  // Date range filters
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 3)
    return format(d, 'yyyy-MM-dd')
  })
  const [endDate, setEndDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    if (!user) return
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T23:59:59')

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end),
      orderBy('dateTime', 'asc'),
    )
    const unsub = onSnapshot(q, snap => {
      const data: AppointmentRow[] = snap.docs.map(d => {
        const x = d.data() as any
        const dt = new Date(x.dateTime?.toDate?.() || x.dateTime)
        const created = x.createdAt?.toDate?.() ? new Date(x.createdAt.toDate()) : (x.createdAt ? new Date(x.createdAt) : undefined)
        return { id: d.id, dateTime: dt, status: x.status, createdAt: created }
      })
      setRows(data)
    })
    return () => unsub()
  }, [user, startDate, endDate])

  // Aggregations
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

  // KPIs
  const kpis = useMemo(() => {
    const total = rows.length
    const completed = rows.filter(r => r.status === 'completed').length
    const noShow = rows.filter(r => r.status === 'no_show').length
    const completionRate = total ? Math.round((completed / total) * 100) : 0

    // Average lead time (days between createdAt and dateTime)
    const withLead = rows.filter(r => r.createdAt)
    const avgLeadDays = withLead.length
      ? Math.round(
          withLead.reduce((acc, r) => acc + Math.max(0, differenceInDays(r.dateTime, r.createdAt!)), 0) / withLead.length,
        )
      : 0

    // Utilization: approximate using business days and 30-min slots (9-17)
    const start = new Date(startDate)
    const end = new Date(endDate)
    const allDays = eachDayOfInterval({ start, end })
    const businessDays = allDays.filter(d => {
      const day = d.getDay()
      return day >= 1 && day <= 5
    }).length
    const slotsPerDay = ((WORK_END_HOUR - WORK_START_HOUR) * 60) / SLOT_MINUTES
    const availableSlots = Math.max(1, Math.floor(businessDays * slotsPerDay))
    const utilization = Math.min(100, Math.round((total / availableSlots) * 100))

    return { total, completed, noShow, completionRate, avgLeadDays, utilization }
  }, [rows, startDate, endDate])

  function exportCurrentCsv() {
    let data: Array<{ name: string; total: number }> = []
    let label = ''
    if (view === 'weekly') { data = weeklyData; label = 'saptamanal' }
    else if (view === 'monthly') { data = monthlyData; label = 'lunar' }
    else if (view === 'quarterly') { data = quarterlyData; label = 'trimestrial' }
    else { data = cancellationData; label = 'anulari' }

    const csv = toCsv(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analitice_${label}_${startDate}_${endDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="grid gap-6 md:grid-cols-5">
      {/* Local analytics sidebar */}
      <aside className="rounded-2xl border border-white/10 bg-white/5 p-3 md:col-span-1">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">Analitice</h2>
          {isDemoMode() && <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-200">Mod demo - date de exemplu</span>}
        </div>
        <div className="mb-3 space-y-2">
          <div>
            <label className="label">De la</label>
            <input className="input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Până la</label>
            <input className="input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button className="btn-ghost w-full" onClick={exportCurrentCsv}>Export CSV</button>
        </div>
        <nav className="flex flex-col gap-2">
          <button className={`btn-ghost justify-start ${view === 'weekly' ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={() => setView('weekly')}>Pacienți pe săptămână</button>
          <button className={`btn-ghost justify-start ${view === 'monthly' ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={() => setView('monthly')}>Pacienți pe lună</button>
          <button className={`btn-ghost justify-start ${view === 'quarterly' ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={() => setView('quarterly')}>Pacienți pe trimestru</button>
          <button className={`btn-ghost justify-start ${view === 'cancellations' ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={() => setView('cancellations')}>Anulări (no-show)</button>
        </nav>
      </aside>

      {/* Charts area */}
      <div className="md:col-span-4 space-y-4">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div className="card"><div className="caption">Total</div><div className="text-2xl font-semibold">{kpis.total}</div></div>
          <div className="card"><div className="caption">Finalizate</div><div className="text-2xl font-semibold">{kpis.completed}</div></div>
          <div className="card"><div className="caption">No-show</div><div className="text-2xl font-semibold">{kpis.noShow}</div></div>
          <div className="card"><div className="caption">Rata finalizare</div><div className="text-2xl font-semibold">{kpis.completionRate}%</div></div>
          <div className="card"><div className="caption">Lead mediu</div><div className="text-2xl font-semibold">{kpis.avgLeadDays} zile</div></div>
          <div className="card"><div className="caption">Utilizare</div><div className="text-2xl font-semibold">{kpis.utilization}%</div></div>
        </div>

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