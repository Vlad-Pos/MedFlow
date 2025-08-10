/**
 * Enhanced Appointments Component for MedFlow
 * 
 * Features:
 * - Modern calendar and list views with MedFlow branding
 * - Enhanced appointment CRUD operations with confirmations
 * - Real-time Firebase synchronization
 * - Professional document management
 * - Responsive design and accessibility
 * - AI integration placeholders for smart scheduling
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, where, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { isDemoMode, subscribeToDemoAppointments, deleteDemoAppointment } from '../utils/demo'
import { useAuth } from '../providers/AuthProvider'
import AppointmentForm from '../components/AppointmentForm'
import DocumentUpload from '../components/DocumentUpload'
import ModernCalendar from '../components/ModernCalendar'
import AppointmentTemplates from '../components/AppointmentTemplates'
import { DeleteAppointmentDialog, CompleteAppointmentDialog } from '../components/ConfirmationDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import NotificationStatus from '../components/NotificationStatus'
import PatientFlagIndicator from '../components/PatientFlagIndicator'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, List, Plus, FileText, User, XCircle, Edit, CheckCircle, Clock, AlertTriangle, ClipboardList, Files, Search } from 'lucide-react'
import { formatDateTime } from '../utils/dateUtils'
import PatientSearch from '../components/PatientSearch'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface DocMeta { id: string; fileUrl: string; fileName: string; contentType: string; createdAt?: any }

interface Appointment {
  id: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: 'scheduled' | 'completed' | 'no_show' | 'confirmed' | 'declined'
  doctorId: string
}

export default function Appointments() {
  const { user } = useAuth()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [creatingAt, setCreatingAt] = useState<string | undefined>(new Date().toISOString().slice(0,16))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [docs, setDocs] = useState<Record<string, DocMeta[]>>({})
  const [view, setView] = useState<'calendar' | 'list' | 'templates'>('calendar')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  
  // Enhanced state for confirmation dialogs
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    appointmentId: string | null
    patientName: string | null
    loading: boolean
  }>({
    isOpen: false,
    appointmentId: null,
    patientName: null,
    loading: false
  })
  
  const [completeDialog, setCompleteDialog] = useState<{
    isOpen: boolean
    appointmentId: string | null
    patientName: string | null
    loading: boolean
  }>({
    isOpen: false,
    appointmentId: null,
    patientName: null,
    loading: false
  })


  // Initialize edit/new from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const edit = params.get('edit') || undefined
    const newAt = params.get('new') || undefined
    
    if (edit) {
      // Editing existing appointment
      setSelectedId(edit)
      setCreatingAt(undefined)
    } else if (newAt) {
      // Creating new appointment with specific time
      setSelectedId(undefined)
      setCreatingAt(newAt)
    } else {
      // Default create mode with current time
      setSelectedId(undefined)
      setCreatingAt(new Date().toISOString().slice(0,16))
    }
  }, [location.search])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    if (isDemoMode()) {
      const unsubscribe = subscribeToDemoAppointments((demoAppointments) => {
        setAppointments(demoAppointments.map(appt => ({
          ...appt,
          dateTime: new Date(appt.dateTime?.toDate?.() || appt.dateTime)
        })))
        setLoading(false)
      })
      return unsubscribe
    }

    try {
      const q = query(
        collection(db, 'appointments'),
        where('doctorId', '==', user.uid),
        orderBy('dateTime', 'desc')
      )
      
      const unsub = onSnapshot(q, 
        (snap) => {
          try {
            const rows = snap.docs.map(d => ({
              id: d.id,
              ...d.data(),
              dateTime: new Date(d.data().dateTime?.toDate?.() || d.data().dateTime)
            })) as Appointment[]
            setAppointments(rows)
            setLoading(false)
            setError(null)
          } catch (processingError) {
            console.error('Appointments: Error processing data:', processingError)
            setError('Eroare la procesarea datelor programărilor')
            setLoading(false)
          }
        },
        (firebaseError) => {
          console.error('Appointments: Firebase error:', firebaseError)
          setError('Eroare la conectarea cu baza de date')
          setLoading(false)
        }
      )
      return () => unsub()
    } catch (setupError) {
      console.error('Appointments: Setup error:', setupError)
      setError('Eroare la configurarea sincronizării datelor')
      setLoading(false)
    }
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

  // Enhanced appointment management functions
  const openDeleteDialog = (appointment: Appointment) => {
    setDeleteDialog({
      isOpen: true,
      appointmentId: appointment.id,
      patientName: appointment.patientName,
      loading: false
    })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      appointmentId: null,
      patientName: null,
      loading: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.appointmentId) return

    setDeleteDialog(prev => ({ ...prev, loading: true }))

    try {
      // Clear selected appointment if it's being deleted
      if (selectedId === deleteDialog.appointmentId) {
        setSelectedId(undefined)
      }

      if (isDemoMode()) {
        deleteDemoAppointment(deleteDialog.appointmentId)
      } else {
        await deleteDoc(doc(db, 'appointments', deleteDialog.appointmentId))
      }

      closeDeleteDialog()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      // Keep dialog open to show error state
      setDeleteDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const openCompleteDialog = (appointment: Appointment) => {
    setCompleteDialog({
      isOpen: true,
      appointmentId: appointment.id,
      patientName: appointment.patientName,
      loading: false
    })
  }

  const closeCompleteDialog = () => {
    setCompleteDialog({
      isOpen: false,
      appointmentId: null,
      patientName: null,
      loading: false
    })
  }

  const handleCompleteConfirm = async () => {
    if (!completeDialog.appointmentId) return

    setCompleteDialog(prev => ({ ...prev, loading: true }))

    try {
      if (isDemoMode()) {
        // In demo mode, we'd need to update demo data
        console.log('Demo mode: marking appointment as completed')
      } else {
        await updateDoc(doc(db, 'appointments', completeDialog.appointmentId), {
          status: 'completed'
        })
      }

      closeCompleteDialog()
    } catch (error) {
      console.error('Error completing appointment:', error)
      setCompleteDialog(prev => ({ ...prev, loading: false }))
    }
  }

  function handleSaved() {
    // Reset to create mode instead of hiding the form
    setSelectedId(undefined)
    setCreatingAt(new Date().toISOString().slice(0,16))
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



  // Enhanced status functions with MedFlow branding
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
      case 'scheduled': return 'bg-medflow-primary/10 text-medflow-primary border border-medflow-primary/20'
      case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
      case 'no_show': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-3 h-3" />
      case 'completed': return <CheckCircle className="w-3 h-3" />
      case 'no_show': return <XCircle className="w-3 h-3" />
      default: return <AlertTriangle className="w-3 h-3" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medflow-text-secondary">
            Se încarcă programările...
          </p>
        </div>
      </div>
    )
  }

  return (
    <DesignWorkWrapper componentName="Appointments">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 text-medflow-text-primary"
        >
          {/* Enhanced Header with MedFlow Branding */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-medflow-text-primary">
                Gestionare Programări
              </h2>
              <div className="flex items-center space-x-2 bg-medflow-surface/60 backdrop-blur-sm rounded-lg p-1">
                <button
                  onClick={() => setView('calendar')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'calendar'
                      ? 'bg-medflow-accent text-white'
                      : 'text-medflow-text-secondary hover:text-medflow-text-primary'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'list'
                      ? 'bg-medflow-accent text-white'
                      : 'text-medflow-text-secondary hover:text-medflow-text-primary'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>Listă</span>
                </button>
                <button
                  onClick={() => setView('templates')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'templates'
                      ? 'bg-medflow-accent text-white'
                      : 'text-medflow-text-secondary hover:text-medflow-text-primary'
                  }`}
                >
                  <Files className="w-4 h-4" />
                  <span>Template</span>
                </button>
              </div>
            </div>
            
            <button 
              className="flex items-center space-x-2 px-4 py-2 bg-medflow-accent text-white rounded-lg hover:bg-medflow-accent-hover transition-colors shadow-md hover:shadow-lg"
              onClick={() => { setSelectedId(undefined); setCreatingAt(new Date().toISOString().slice(0,16)) }}
            >
              <Plus className="w-4 h-4" />
              <span>Programare nouă</span>
            </button>
          </div>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center space-x-3 p-4 bg-red-500/20 border border-red-400/30 rounded-lg"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-200">
                    Eroare de încărcare
                  </h4>
                  <p className="text-sm text-red-200">
                    {error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Patient Search for New Appointments */}
          <div className="bg-medflow-surface/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-medflow-text-primary mb-4 flex items-center space-x-2">
              <Search className="w-5 h-5 text-medflow-accent" />
              <span>Programare pentru pacient existent</span>
            </h3>
            <PatientSearch 
              onPatientSelect={(patient) => {
                // Pre-fill appointment form with patient data
                // This would require updating AppointmentForm to accept patient data
                console.log('Selected patient for appointment:', patient)
                // Future: setSelectedPatientForAppointment(patient)
              }}
              placeholder="Căutați pacient pentru a crea programare..."
            />
            <p className="text-sm text-medflow-text-muted mt-2">
              Selectați un pacient existent pentru a pre-completa informațiile de contact în formularul de programare.
            </p>
          </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar/List View */}
          <div className="lg:col-span-2">
            {view === 'calendar' ? (
              <ModernCalendar
                onAppointmentClick={handleAppointmentClick}
                onTimeSlotClick={handleTimeSlotClick}
              />
            ) : view === 'templates' ? (
              <AppointmentTemplates
                onSelectTemplate={(template) => {
                  // When template is selected, switch to calendar view and open appointment form
                  setView('calendar')
                  setSelectedId(undefined)
                  setCreatingAt(new Date().toISOString().slice(0,16))
                  // TODO: Pre-fill form with template data
                }}
                showManagement={true}
              />
            ) : (
              <div className="space-y-4">
                <div className="bg-medflow-surface/60 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
                  <div className="space-y-1">
                    {appointments.map((appointment) => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 hover:bg-medflow-surface/80 transition-colors border-b border-white/10 last:border-b-0"
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-medflow-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-medflow-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold text-medflow-text-primary truncate">
                                {appointment.patientName}
                              </h3>
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {getStatusIcon(appointment.status)}
                                <span>{getStatusText(appointment.status)}</span>
                              </span>
                            </div>
                            <div className="text-sm text-medflow-text-secondary">
                              📅 {formatDateTime(appointment.dateTime)}
                            </div>
                            {appointment.symptoms && (
                              <div className="text-xs text-medflow-text-muted mt-1 truncate">
                                {appointment.symptoms}
                              </div>
                            )}
                            
                            {/* Notification Status Indicator */}
                            <div className="mt-2">
                              <NotificationStatus 
                                appointment={appointment as any} 
                                compact={true}
                              />
                            </div>
                            
                            {/* Patient Flag Indicator */}
                            <div className="mt-2">
                              <PatientFlagIndicator 
                                patientId={appointment.patientEmail || appointment.patientName}
                                patientName={appointment.patientName}
                                mode="badge"
                                showTooltip={true}
                                onViewDetails={(patientId) => {
                                  console.log('View patient flag details:', patientId)
                                  // TODO: Navigate to patient flag history
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {appointment.status === 'completed' && (
                            <Link
                              to={`/reports?appointmentId=${appointment.id}&patientId=${appointment.patientEmail || appointment.patientName}&patientName=${encodeURIComponent(appointment.patientName)}&action=new`}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Creează raport medical"
                            >
                              <ClipboardList className="w-4 h-4" />
                            </Link>
                          )}
                          {appointment.status === 'scheduled' && (
                            <button 
                              className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                              onClick={() => openCompleteDialog(appointment)}
                              title="Marchează ca finalizat"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            className="p-2 text-medflow-primary hover:text-medflow-secondary hover:bg-medflow-primary/10 rounded-lg transition-colors"
                            onClick={() => handleAppointmentClick(appointment)}
                            title="Editează programarea"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            onClick={() => openDeleteDialog(appointment)}
                            title="Șterge programarea"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    
                    {appointments.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-16 text-center"
                      >
                        <div className="w-16 h-16 bg-medflow-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-medflow-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Nu există programări încă
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                          Creați prima programare pentru a începe să gestionați calendarul medical.
                        </p>
                        <button
                          onClick={() => { setSelectedId(undefined); setCreatingAt(new Date().toISOString().slice(0,16)) }}
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-medflow-primary text-white rounded-lg hover:bg-medflow-secondary transition-colors shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Creează programare</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Form Sidebar - Always Visible */}
          <div className="space-y-4">
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="card sticky top-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-medflow-text-primary">
                  {selectedId ? 'Editează programare' : 'Creează programare'}
                </h3>
                {selectedId && (
                  <button
                    onClick={handleSaved}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Închide editarea"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              <AppointmentForm 
                appointmentId={selectedId} 
                onSaved={handleSaved}
              />
            </motion.div>

            {/* Documents Section - Always Visible */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
          </div>
        </div>
        </motion.section>

        {/* Confirmation Dialogs */}
        <DeleteAppointmentDialog
          isOpen={deleteDialog.isOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteConfirm}
          patientName={deleteDialog.patientName || undefined}
          loading={deleteDialog.loading}
        />

        <CompleteAppointmentDialog
          isOpen={completeDialog.isOpen}
          onClose={closeCompleteDialog}
          onConfirm={handleCompleteConfirm}
          patientName={completeDialog.patientName || undefined}
          loading={completeDialog.loading}
        />
      </div>
    </DesignWorkWrapper>
  )
}