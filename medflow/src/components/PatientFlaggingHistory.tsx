/**
 * Patient Flagging History Component for MedFlow
 * 
 * Comprehensive interface for doctors to view patient flagging history,
 * statistics, and manage flag resolution with GDPR compliance.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flag, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Eye,
  CheckCircle,
  Search,
  RefreshCw,
  MessageSquare
} from 'lucide-react'
import { PatientFlag, PatientFlagSummary, FlagSeverity, FlagStatus } from '../types/patientFlagging'
import PatientFlaggingService from '../services/patientFlagging'
import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '../providers/AuthProvider'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { Timestamp } from 'firebase/firestore'
interface PatientFlaggingHistoryProps {
  patientId?: string
  className?: string
  showFilters?: boolean
  maxItems?: number
}

interface FlagResolutionModalProps {
  flag: PatientFlag
  isOpen: boolean
  onClose: () => void
  onResolve: (flagId: string, notes: string) => void
}

/**
 * Flag resolution modal
 */
function FlagResolutionModal({ flag, isOpen, onClose, onResolve }: FlagResolutionModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resolutionNotes.trim()) {
      return
    }
    
    setSubmitting(true)
    try {
      await onResolve(flag.id, resolutionNotes)
      setResolutionNotes('')
      onClose()
    } catch (error) {
      console.error('Error resolving flag:', error)
    } finally {
      setSubmitting(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rezolvă Semnalizarea
          </h3>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Flag className="w-4 h-4 text-red-600" />
              <span className="font-medium">{flag.patientName}</span>
            </div>
            <p className="text-sm text-gray-600">{flag.description}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note de rezolvare *
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Descrieți cum a fost rezolvată semnalizarea și ce măsuri au fost luate..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={submitting || !resolutionNotes.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Se rezolvă...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Rezolvă Semnalizarea
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Main patient flagging history component
 */
export default function PatientFlaggingHistory({
  patientId,
  className = '',
  showFilters = true,
  maxItems = 50
}: PatientFlaggingHistoryProps) {
  const { user } = useAuth()
  const [flags, setFlags] = useState<PatientFlag[]>([])
  const [summary, setSummary] = useState<PatientFlagSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<FlagSeverity | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<FlagStatus | 'all'>('all')
  const [showResolved, setShowResolved] = useState(false)
  
  // Resolution modal
  const [resolutionModal, setResolutionModal] = useState<{
    isOpen: boolean
    flag: PatientFlag | null
  }>({ isOpen: false, flag: null })
  
  // Load data on component mount
  useEffect(() => {
    if (patientId) {
      loadPatientFlags()
      loadPatientSummary()
    } else {
      loadAllFlags()
    }
  }, [patientId, showResolved])
  
  /**
   * Load flags for specific patient
   */
  const loadPatientFlags = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const flagsData = await PatientFlaggingService.getPatientFlags(
        patientId!,
        showResolved
      )
      
      setFlags(flagsData.slice(0, maxItems))
    } catch (error) {
      console.error('Error loading patient flags:', error)
      setError('Nu s-au putut încărca semnalizările pacientului')
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Load patient flag summary
   */
  const loadPatientSummary = async () => {
    try {
      const summaryData = await PatientFlaggingService.getPatientFlagSummary(patientId!)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading patient summary:', error)
    }
  }
  
  /**
   * Load all flags for doctor (when no specific patient)
   */
  const loadAllFlags = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Implement service method to get all flags for doctor
      setFlags([])
    } catch (error) {
      console.error('Error loading all flags:', error)
      setError('Nu s-au putut încărca semnalizările')
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Handle flag resolution
   */
  const handleResolveFlag = async (flagId: string, resolutionNotes: string) => {
    try {
      await PatientFlaggingService.resolvePatientFlag(
        flagId,
        resolutionNotes,
        user!.uid
      )
      
      // Update local state
      setFlags(prev => prev.map(flag =>
        flag.id === flagId
          ? { ...flag, status: 'resolved', resolvedAt: Timestamp.now(), resolutionNotes }
          : flag
      ))
      
      // Reload summary if viewing specific patient
      if (patientId) {
        loadPatientSummary()
      }
    } catch (error) {
      console.error('Error resolving flag:', error)
      throw error
    }
  }
  
  /**
   * Get severity color classes
   */
  const getSeverityColor = (severity: FlagSeverity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-orange-600 bg-orange-100'
      case 'low': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  /**
   * Get status color classes
   */
  const getStatusColor = (status: FlagStatus) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'dismissed': return 'text-gray-600 bg-gray-100'
      case 'appealed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }
  
  /**
   * flags based on search and filters
   */
  const filteredFlags = flags.filter(flag => {
    if (searchTerm && !flag.patientName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    if (severityFilter !== 'all' && flag.severity !== severityFilter) {
      return false
    }
    
    if (statusFilter !== 'all' && flag.status !== statusFilter) {
      return false
    }
    
    return true
  })
  
  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="loader mb-4"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Se încarcă istoricul semnalizărilor...
          </p>
        </div>
      </div>
    )
  }
  
  /**
   * Render error state
   */
  if (error) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary (if viewing specific patient) */}
      {summary && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Rezumat Semnalizări - {summary.patientName}
            </h3>
            <button
              onClick={() => {
                if (patientId) {
                  loadPatientFlags()
                  loadPatientSummary()
                } else {
                  loadAllFlags()
                }
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Reîncarcă datele"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{summary.totalFlags}</div>
              <div className="text-sm text-gray-600">Total semnalizări</div>
            </div>
            
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.activeFlags}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.resolvedFlags}</div>
              <div className="text-sm text-gray-600">Rezolvate</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className={`text-2xl font-bold ${
                summary.riskLevel === 'high' ? 'text-red-600' :
                summary.riskLevel === 'medium' ? 'text-orange-600' :
                summary.riskLevel === 'low' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {summary.riskLevel === 'high' ? 'Mare' :
                 summary.riskLevel === 'medium' ? 'Mediu' :
                 summary.riskLevel === 'low' ? 'Scăzut' : 'Fără'}
              </div>
              <div className="text-sm text-gray-600">Nivel risc</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-white border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Caută pacient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Severity */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as FlagSeverity | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toate severitățile</option>
              <option value="high">Severitate mare</option>
              <option value="medium">Severitate medie</option>
              <option value="low">Severitate scăzută</option>
            </select>
            
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FlagStatus | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Toate statusurile</option>
              <option value="active">Active</option>
              <option value="resolved">Rezolvate</option>
              <option value="dismissed">Respinse</option>
            </select>
            
            {/* Show Resolved Toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Include rezolvate</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Flags List */}
      <div className="space-y-3">
        {filteredFlags.length === 0 ? (
          <div className="text-center py-8">
            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-600 font-medium mb-1">
              Nu există semnalizări
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || severityFilter !== 'all' || statusFilter !== 'all'
                ? 'Nu au fost găsite semnalizări cu criteriile selectate'
                : 'Acest pacient nu are semnalizări înregistrate'
              }
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredFlags.map((flag) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <Flag className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-gray-900">{flag.patientName}</h4>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(flag.severity)}`}>
                        {flag.severity === 'high' ? 'Mare' :
                         flag.severity === 'medium' ? 'Mediu' : 'Scăzut'}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}>
                        {flag.status === 'active' ? 'Activ' :
                         flag.status === 'resolved' ? 'Rezolvat' :
                         flag.status === 'dismissed' ? 'Respins' : 'În apel'}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-700 mb-3">{flag.description}</p>
                    
                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          Creat: {format(flag.createdAt.toDate(), 'dd MMM yyyy', { locale: ro })}
                        </span>
                      </div>
                      
                      {flag.appointmentDateTime && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            Programare: {format(flag.appointmentDateTime?.toDate(), 'dd MMM yyyy HH:mm', { locale: ro })}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        <span>{flag.notificationsSent} notificări trimise</span>
                      </div>
                    </div>
                    
                    {/* Resolution Info */}
                    {flag.status === 'resolved' && flag.resolutionNotes && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Rezolvat</span>
                          {flag.resolvedAt && (
                            <span className="ml-2 text-sm text-green-600">
                              ({format(flag.resolvedAt?.toDate(), 'dd MMM yyyy', { locale: ro })})
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-green-700">{flag.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {flag.status === 'active' && (
                      <button
                        onClick={() => setResolutionModal({ isOpen: true, flag })}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                        title="Rezolvă semnalizarea"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        // TODO: View detailed flag information
                        console.log('View flag details:', flag.id)
                      }}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      title="Vezi detalii"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      
      {/* Flag Resolution Modal */}
      {resolutionModal.flag && (
        <FlagResolutionModal
          flag={resolutionModal.flag}
          isOpen={resolutionModal.isOpen}
          onClose={() => setResolutionModal({ isOpen: false, flag: null })}
          onResolve={handleResolveFlag}
        />
      )}
      </div>
    )
}
