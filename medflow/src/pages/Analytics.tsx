import { useEffect, useState, useCallback } from 'react'
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../services/firebase'
import { isDemoMode } from '../utils/demo'
import { useAuth } from '../providers/AuthProvider'
import { formatDate } from '../utils/dateUtils'
interface AppointmentStats {
  total: number
  scheduled: number
  completed: number
  noShow: number
  completionRate: number
}

interface MonthlyStats {
  month: string
  appointments: number
  completed: number
  revenue: number
}

interface Appointment {
  id: string
  patientName: string
  status: 'scheduled' | 'completed' | 'no_show'
  dateTime: Date | string
  doctorId?: string
}

export default function Analytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    scheduled: 0,
    completed: 0,
    noShow: 0,
    completionRate: 0
  })
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  // Utility function to safely convert dateTime to Date
  const safeConvertToDate = useCallback((dateTime: Date | string): Date => {
    if (dateTime instanceof Date) {
      return dateTime
    }
    if (typeof dateTime === 'string') {
      return new Date(dateTime)
    }
    // Fallback for Timestamp objects
    if (dateTime && typeof dateTime === 'object' && 'toDate' in dateTime) {
      return (dateTime as any).toDate()
    }
    return new Date()
  }, [])

  useEffect(() => {
    if (!user) return

    // Demo data for development
    if (isDemoMode()) {
      const demoStats: AppointmentStats = {
        total: 156,
        scheduled: 23,
        completed: 133,
        noShow: 8,
        completionRate: 85
      }
      setStats(demoStats)

      const demoMonthlyStats: MonthlyStats[] = [
        { month: 'Ianuarie 2024', appointments: 28, completed: 24, revenue: 1800 },
        { month: 'Februarie 2024', appointments: 31, completed: 27, revenue: 2025 },
        { month: 'Martie 2024', appointments: 29, completed: 25, revenue: 1875 },
        { month: 'Aprilie 2024', appointments: 26, completed: 22, revenue: 1650 },
        { month: 'Mai 2024', appointments: 30, completed: 26, revenue: 1950 },
        { month: 'Iunie 2024', appointments: 22, completed: 19, revenue: 1425 }
      ]
      setMonthlyStats(demoMonthlyStats)
      setLoading(false)
      return
    }

    // Real data from Firestore
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('dateTime', 'desc'),
      limit(100)
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const rows: Appointment[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Appointment))

      // Calculate stats
      const total = rows.length
      const scheduled = rows.filter(row => row.status === 'scheduled').length
      const completed = rows.filter(row => row.status === 'completed').length
      const noShow = rows.filter(row => row.status === 'no_show').length
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

      setStats({ total, scheduled, completed, noShow, completionRate })
      
      // Calculate monthly stats from real data
      const monthlyData = rows.reduce((acc: Record<string, { appointments: number; completed: number; revenue: number }>, appointment) => {
        const date = safeConvertToDate(appointment.dateTime)
        const monthKey = date.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })
        
        if (!acc[monthKey]) {
          acc[monthKey] = { appointments: 0, completed: 0, revenue: 0 }
        }
        
        acc[monthKey].appointments++
        if (appointment.status === 'completed') {
          acc[monthKey].completed++
          acc[monthKey].revenue += 75 // Assuming 75 RON per appointment
        }
        
        return acc
      }, {})
      
      const monthlyStats = Object.entries(monthlyData).map(([month, data]: [string, { appointments: number; completed: number; revenue: number }]) => ({
        month,
        appointments: data.appointments,
        completed: data.completed,
        revenue: data.revenue
      })).slice(0, 6) // Last 6 months
      
      setMonthlyStats(monthlyStats)
      setAppointments(rows) // Set appointments for the recent appointments section
      setLoading(false)
    })
    
    return () => unsub()
  }, [user, safeConvertToDate])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">Se încarcă analitica...</div>
      </div>
    )
  }

  return (
    <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[var(--medflow-text-primary)]">Analitica și Rapoarte</h2>
          {isDemoMode() && (
            <div className="rounded-md bg-[var(--medflow-brand-2)]/20 p-3 text-sm text-[var(--medflow-brand-2)] border border-[var(--medflow-brand-2)]/30">
              Mod demo - date de exemplu
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card bg-[var(--medflow-surface-elevated)] border border-[var(--medflow-border)]">
            <div className="text-sm text-[var(--medflow-text-tertiary)]">Total Programări</div>
            <div className="text-2xl font-bold text-[var(--medflow-brand-1)]">{stats.total}</div>
          </div>
          <div className="card bg-[var(--medflow-surface-elevated)] border border-[var(--medflow-border)]">
            <div className="text-sm text-[var(--medflow-text-tertiary)]">Programate</div>
            <div className="text-2xl font-bold text-[var(--medflow-brand-2)]">{stats.scheduled}</div>
          </div>
          <div className="card bg-[var(--medflow-surface-elevated)] border border-[var(--medflow-border)]">
            <div className="text-sm text-[var(--medflow-text-tertiary)]">Finalizate</div>
            <div className="text-2xl font-bold text-[var(--medflow-brand-3)]">{stats.completed}</div>
          </div>
          <div className="card bg-[var(--medflow-surface-elevated)] border border-[var(--medflow-border)]">
            <div className="text-sm text-[var(--medflow-text-tertiary)]">Rata de Finalizare</div>
            <div className="text-2xl font-bold text-[var(--medflow-brand-4)]">
              {stats.completionRate}%
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="card bg-[var(--medflow-surface-elevated)] border border-[var(--medflow-border)]">
          <h3 className="text-lg font-semibold text-[var(--medflow-text-primary)] mb-4">Evoluția lunară</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {monthlyStats.map((month, index) => (
              <div key={month.month} className="flex flex-col items-center space-y-2">
                <div 
                  className="w-8 bg-gradient-to-t from-[var(--medflow-brand-1)] to-[var(--medflow-brand-2)] rounded-t"
                  style={{ height: `${(month.appointments / Math.max(...monthlyStats.map(m => m.appointments))) * 200}px` }}
                ></div>
                <span className="text-xs text-[var(--medflow-text-tertiary)]">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="card bg-[var(--medflow-surface-elevated)] border border-[var(--medflow-border)]">
          <h3 className="text-lg font-semibold text-[var(--medflow-text-primary)] mb-4">Programări recente</h3>
          <div className="space-y-3">
            {appointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-[var(--medflow-surface-dark)] rounded-lg">
                <div>
                  <div className="font-medium text-[var(--medflow-text-primary)]">{appointment.patientName}</div>
                  <div className="text-sm text-[var(--medflow-text-tertiary)]">
                    {formatDate(appointment.dateTime)}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  appointment.status === 'scheduled' ? 'bg-[var(--medflow-brand-2)]/20 text-[var(--medflow-brand-2)]' :
                  appointment.status === 'completed' ? 'bg-[var(--medflow-brand-3)]/20 text-[var(--medflow-brand-3)]' :
                  'bg-red-100 text-red-800'
                }`}>
                  {appointment.status === 'scheduled' ? 'Programată' :
                   appointment.status === 'completed' ? 'Finalizată' : 'Nu s-a prezentat'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h3 className="mb-3 text-lg font-semibold text-[var(--medflow-text-primary)]">Insights</h3>
            <ul className="space-y-2 text-sm text-[var(--medflow-text-primary)]">
              <li>• Rata de finalizare: {stats.completionRate}%</li>
              <li>• Programări active: {stats.scheduled}</li>
              <li>• Pacienți care nu s-au prezentat: {stats.noShow}</li>
              <li>• Venit mediu lunar: {monthlyStats.length > 0 ? 
                Math.round(monthlyStats.reduce((sum, m) => sum + m.revenue, 0) / monthlyStats.length).toLocaleString('ro-RO') : 0} RON</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="mb-3 text-lg font-semibold text-[var(--medflow-text-primary)]">Recomandări</h3>
            <ul className="space-y-2 text-sm text-[var(--medflow-text-primary)]">
              {stats.completionRate < 80 && (
                <li className="text-amber-600">• Îmbunătățiți rata de finalizare prin follow-up</li>
              )}
              {stats.scheduled > stats.completed && (
                <li className="text-blue-600">• Aveți multe programări active - planificați-vă timpul</li>
              )}
              {monthlyStats.length > 0 && monthlyStats[monthlyStats.length - 1].appointments > 50 && (
                <li className="text-green-600">• Performanță excelentă în ultima lună!</li>
              )}
                              <li className="text-[var(--medflow-text-tertiary)]">• Verificați rapoartele lunare pentru tendințe</li>
            </ul>
          </div>
        </div>
      </section>
    )
}
