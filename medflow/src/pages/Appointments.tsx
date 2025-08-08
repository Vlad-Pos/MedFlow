import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { isDemoMode, subscribeToDemoAppointments, deleteDemoAppointment } from '../utils/demo'
import { useAuth } from '../providers/AuthProvider'
import AppointmentForm from '../components/AppointmentForm'
import DocumentUpload from '../components/DocumentUpload'
import ModernCalendar from '../components/ModernCalendar'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, List, Plus, FileText, User, XCircle } from 'lucide-react'
import { formatDateTime } from '../utils/dateUtils'

interface DocMeta { id: string; fileUrl: string; fileName: string; contentType: string; createdAt?: any }

interface Appointment {
  id: string
  patientName: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: 'scheduled' | 'completed' | 'no_show'
  doctorId: string
}

export default function Appointments() {
  const { user } = useAuth()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [creatingAt, setCreatingAt] = useState<string | undefined>(undefined)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [docs, setDocs] = useState<Record<string, DocMeta[]>>({})
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const location = useLocation()


  // Initialize edit/new from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const edit = params.get('edit') || undefined
    const newAt = params.get('new') || undefined
    setSelectedId(edit)
    setCreatingAt(newAt || undefined)
  }, [location.search])

  useEffect(() => {
    if (!user) return

    if (isDemoMode()) {
      // Subscribe to demo appointments
      const unsubscribe = subscribeToDemoAppointments((demoAppointments) => {
        setAppointments(demoAppointments.map(appt => ({
          ...appt,
          dateTime: new Date(appt.dateTime?.toDate?.() || appt.dateTime)
        })))
      })
      return unsubscribe
    }

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('dateTime', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        dateTime: new Date(d.data().dateTime?.toDate?.() || d.data().dateTime)
      })) as Appointment[]
      setAppointments(rows)
    })
    return () => unsub()
  }, [user])

  // Listen for docs per appointment
  useEffect(() => {
    if (isDemoMode()) {
      setDocs({})
      return
    }
    const unsubs: (() => void)[] = []
    for (const appt of appointments) {
      const q = query(collection(db, 'documents'), where('appointmentId', '==', appt.id), orderBy('createdAt', 'desc'))
      const unsub = onSnapshot(q, (snap) => {
        const d = snap.docs.map(dd => ({ id: dd.id, ...(dd.data() as any) }))
        setDocs(prev => ({ ...prev, [appt.id]: d }))
      })
      unsubs.push(unsub)
    }
    return () => { unsubs.forEach(u => u()) }
  }, [appointments])

  async function handleDelete(id: string) {
    if (!confirm('Ștergeți programarea?')) return
    
    // Clear selected appointment if it's being deleted
    if (selectedId === id) {
      setSelectedId(undefined)
    }
    
    if (isDemoMode()) {
      deleteDemoAppointment(id)
      return
    }
    await deleteDoc(doc(db, 'appointments', id))
  }

  function handleSaved() {
    setSelectedId(undefined)
    setCreatingAt(undefined)
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedId(appointment.id)
    setCreatingAt(undefined)
  }

  const handleTimeSlotClick = (date: Date) => {
    const iso = new Date(date.getTime() - date.getTimezoneOffset()*60000).toISOString().slice(0,16)
    setCreatingAt(iso)
    setSelectedId(undefined)
  }



  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Programat'
      case 'completed': return 'Finalizat'
      case 'no_show': return 'Nu s-a prezentat'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'no_show': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Programări
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === 'list'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Listă</span>
            </button>
          </div>
        </div>
        
        <button 
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => { setSelectedId(undefined); setCreatingAt(undefined) }}
        >
          <Plus className="w-4 h-4" />
          <span>Nouă programare</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar/List View */}
        <div className="lg:col-span-2">
          {view === 'calendar' ? (
            <ModernCalendar
              onAppointmentClick={handleAppointmentClick}
              onTimeSlotClick={handleTimeSlotClick}
            />
          ) : (
            <div className="space-y-4">
              <div className="card">
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(appointment.dateTime)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                            onClick={() => handleDelete(appointment.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {appointments.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center"
                    >
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nu există programări încă
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Creați prima programare pentru a începe să gestionați calendarul.
                      </p>
                      <Link 
                        to="/dashboard" 
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Creează programare</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Appointment Form Sidebar */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {(selectedId || creatingAt) && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="card sticky top-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedId ? 'Editează programare' : 'Creează programare'}
                  </h3>
                  <button
                    onClick={handleSaved}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <AppointmentForm appointmentId={selectedId} onSaved={handleSaved} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Documents Section */}
          <AnimatePresence>
            {(selectedId || creatingAt) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="card"
              >
                <h4 className="mb-3 font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Documente</span>
                </h4>
                {selectedId ? (
                  <>
                    <DocumentUpload appointmentId={selectedId} />
                    <div className="mt-4 space-y-2">
                      {(docs[selectedId] || []).map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-2 rounded border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <a 
                            href={doc.fileUrl} 
                            target="_blank" 
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 truncate flex-1"
                          >
                            {doc.fileName}
                          </a>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatDateTime(doc.createdAt?.toDate?.() || doc.createdAt)}
                          </span>
                        </motion.div>
                      ))}
                      {(docs[selectedId]?.length || 0) === 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          Nu există documente încărcate.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Salvați mai întâi programarea pentru a încărca documente.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  )
}