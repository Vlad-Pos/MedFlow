import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase'
import { isDemoMode } from '../utils/demo'
import { useAuth } from '../providers/AuthProvider'
import { formatDate } from '../utils/dateUtils'
import DesignWorkWrapper from '../../DesignWorkWrapper'

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
  dateTime: any
  doctorId?: string
}

export default function Analytics() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    scheduled: 0,
    completed: 0,
    noShow: 0,
    completionRate: 0
  })
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    if (isDemoMode()) {
      // Demo analytics data
      const demoAppointments: Appointment[] = [
        { id: '1', patientName: 'Ion Popescu', status: 'scheduled', dateTime: new Date() },
        { id: '2', patientName: 'Maria Ionescu', status: 'completed', dateTime: new Date(Date.now() - 86400000) },
        { id: '3', patientName: 'George Enache', status: 'no_show', dateTime: new Date(Date.now() - 172800000) },
        { id: '4', patientName: 'Ana Dumitrescu', status: 'completed', dateTime: new Date(Date.now() - 259200000) },
        { id: '5', patientName: 'Vasile Popa', status: 'scheduled', dateTime: new Date(Date.now() + 86400000) },
        { id: '6', patientName: 'Elena Marin', status: 'completed', dateTime: new Date(Date.now() - 345600000) },
      ]
      
      setAppointments(demoAppointments)
      
      // Calculate demo stats
      const total = demoAppointments.length
      const scheduled = demoAppointments.filter(a => a.status === 'scheduled').length
      const completed = demoAppointments.filter(a => a.status === 'completed').length
      const noShow = demoAppointments.filter(a => a.status === 'no_show').length
      const completionRate = total > 0 ? Math.round((completed / (completed + noShow)) * 100) : 0
      
      setStats({ total, scheduled, completed, noShow, completionRate })
      
      // Demo monthly stats
      const demoMonthlyStats = [
        { month: 'Ianuarie 2024', appointments: 45, completed: 38, revenue: 2850 },
        { month: 'Februarie 2024', appointments: 52, completed: 47, revenue: 3525 },
        { month: 'Martie 2024', appointments: 48, completed: 42, revenue: 3150 },
        { month: 'Aprilie 2024', appointments: 55, completed: 49, revenue: 3675 },
        { month: 'Mai 2024', appointments: 51, completed: 45, revenue: 3375 },
        { month: 'Iunie 2024', appointments: 58, completed: 52, revenue: 3900 },
      ]
      setMonthlyStats(demoMonthlyStats)
      setLoading(false)
      return
    }

    // Real Firebase data
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('dateTime', 'desc')
    )
    
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Appointment[]
      setAppointments(rows)
      
      // Calculate real stats
      const total = rows.length
      const scheduled = rows.filter(a => a.status === 'scheduled').length
      const completed = rows.filter(a => a.status === 'completed').length
      const noShow = rows.filter(a => a.status === 'no_show').length
      const completionRate = total > 0 ? Math.round((completed / (completed + noShow)) * 100) : 0
      
      setStats({ total, scheduled, completed, noShow, completionRate })
      
      // Calculate monthly stats from real data
      const monthlyData = rows.reduce((acc: Record<string, any>, appointment) => {
        const date = new Date(appointment.dateTime?.toDate?.() || appointment.dateTime)
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
      
      const monthlyStats = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
        month,
        appointments: data.appointments,
        completed: data.completed,
        revenue: data.revenue
      })).slice(0, 6) // Last 6 months
      
      setMonthlyStats(monthlyStats)
      setLoading(false)
    })
    
    return () => unsub()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg">Se încarcă analitica...</div>
      </div>
    )
  }

  return (
    <DesignWorkWrapper componentName="Analytics">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Analitica și Rapoarte</h2>
          {isDemoMode() && (
            <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20">
              Mod demo - date de exemplu
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card">
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Programări</div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 dark:text-gray-300">Programate</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.scheduled}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 dark:text-gray-300">Finalizate</div>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 dark:text-gray-300">Rata de Finalizare</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.completionRate}%</div>
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Performanța Lunară</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-2 text-left">Luna</th>
                  <th className="px-4 py-2 text-left">Programări</th>
                  <th className="px-4 py-2 text-left">Finalizate</th>
                  <th className="px-4 py-2 text-left">Venit (RON)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3">{month.month}</td>
                    <td className="px-4 py-3">{month.appointments}</td>
                    <td className="px-4 py-3">{month.completed}</td>
                    <td className="px-4 py-3 font-medium">{month.revenue.toLocaleString('ro-RO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Programări Recente</h3>
          <div className="space-y-3">
            {appointments.slice(0, 10).map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div>
                  <div className="font-medium">{appointment.patientName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDate(appointment.dateTime?.toDate?.() || appointment.dateTime)}
                  </div>
                </div>
                <div className={`rounded-full px-3 py-1 text-sm font-medium ${
                  appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20' :
                  appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20' :
                  'bg-red-100 text-red-800 dark:bg-red-900/20'
                }`}>
                  {appointment.status === 'scheduled' ? 'Programat' :
                   appointment.status === 'completed' ? 'Finalizat' : 'Nu s-a prezentat'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h3 className="mb-3 text-lg font-semibold">Insights</h3>
            <ul className="space-y-2 text-sm">
              <li>• Rata de finalizare: {stats.completionRate}%</li>
              <li>• Programări active: {stats.scheduled}</li>
              <li>• Pacienți care nu s-au prezentat: {stats.noShow}</li>
              <li>• Venit mediu lunar: {monthlyStats.length > 0 ? 
                Math.round(monthlyStats.reduce((sum, m) => sum + m.revenue, 0) / monthlyStats.length).toLocaleString('ro-RO') : 0} RON</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="mb-3 text-lg font-semibold">Recomandări</h3>
            <ul className="space-y-2 text-sm">
              {stats.completionRate < 80 && (
                <li className="text-amber-600">• Îmbunătățiți rata de finalizare prin follow-up</li>
              )}
              {stats.scheduled > stats.completed && (
                <li className="text-blue-600">• Aveți multe programări active - planificați-vă timpul</li>
              )}
              {monthlyStats.length > 0 && monthlyStats[monthlyStats.length - 1].appointments > 50 && (
                <li className="text-green-600">• Performanță excelentă în ultima lună!</li>
              )}
              <li className="text-gray-600">• Verificați rapoartele lunare pentru tendințe</li>
            </ul>
          </div>
        </div>
      </section>
    </DesignWorkWrapper>
  )
}
