/**
 * GDPR Compliance Manager for Patient Flagging System
 * 
 * Provides comprehensive GDPR compliance features for patient flagging
 * including consent management, data access, and right to be forgotten.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Eye, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Lock,
  Clock,
  User,
  Settings
} from 'lucide-react'
import { PatientFlagGDPRData, PatientFlagSummary } from '../types/patientFlagging'
import LoadingSpinner from './LoadingSpinner'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface GDPRComplianceManagerProps {
  patientId: string
  patientName: string
  className?: string
  onDataExported?: (data: any) => void
  onDataDeleted?: () => void
}

interface GDPRAction {
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restrict'
  title: string
  description: string
  icon: React.ReactNode
  actionButton: string
  confirmMessage: string
}

export default function GDPRComplianceManager({
  patientId,
  patientName,
  className = '',
  onDataExported,
  onDataDeleted
}: GDPRComplianceManagerProps) {
  const [gdprData, setGdprData] = useState<PatientFlagGDPRData | null>(null)
  const [flagSummary, setFlagSummary] = useState<PatientFlagSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    isOpen: boolean
    action: GDPRAction | null
  }>({ isOpen: false, action: null })
  
  // GDPR actions available to patients
  const gdprActions: GDPRAction[] = [
    {
      type: 'access',
      title: 'Dreptul de acces',
      description: 'Solicitați o copie a tuturor datelor personale stocate',
      icon: <Eye className="w-5 h-5" />,
      actionButton: 'Exportă datele mele',
      confirmMessage: 'Doriți să exportați toate datele personale stocate? Veți primi un fișier cu toate informațiile.'
    },
    {
      type: 'rectification',
      title: 'Dreptul la rectificare',
      description: 'Solicitați corectarea datelor personale inexacte',
      icon: <Settings className="w-5 h-5" />,
      actionButton: 'Solicitare corectare',
      confirmMessage: 'Doriți să solicitați corectarea datelor personale? Doctorul va fi notificat de această solicitare.'
    },
    {
      type: 'erasure',
      title: 'Dreptul la ștergere',
      description: 'Solicitați ștergerea datelor personale (dreptul de a fi uitat)',
      icon: <Trash2 className="w-5 h-5" />,
      actionButton: 'Șterge datele mele',
      confirmMessage: 'ATENȚIE: Această acțiune va șterge permanent toate semnalizările și datele asociate. Această operațiune nu poate fi anulată!'
    },
    {
      type: 'portability',
      title: 'Dreptul la portabilitatea datelor',
      description: 'Exportați datele într-un format structurat și ușor de citit',
      icon: <Download className="w-5 h-5" />,
      actionButton: 'Exportă pentru transfer',
      confirmMessage: 'Doriți să exportați datele pentru transfer la un alt furnizor? Veți primi datele în format JSON.'
    },
    {
      type: 'restrict',
      title: 'Dreptul la restricționarea procesării',
      description: 'Solicitați restricționarea procesării datelor personale',
      icon: <Lock className="w-5 h-5" />,
      actionButton: 'Restricționează procesarea',
      confirmMessage: 'Doriți să restricționați procesarea datelor? Semnalizările vor fi păstrate dar nu vor fi procesate activ.'
    }
  ]
  
  // Load GDPR data on component mount
  useEffect(() => {
    loadGDPRData()
  }, [patientId])
  
  /**
   * Load GDPR compliance data
   */
  const loadGDPRData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Implement actual service calls
      // For now, create mock data
      const mockGdprData: PatientFlagGDPRData = {
        patientId,
        consentToFlagging: true,
        consentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) as any, // 30 days ago
        consentWithdrawn: false,
        dataAccessRequests: [
          {
            requestDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) as any, // 15 days ago
            fulfilledDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) as any, // 14 days ago
            requestType: 'access'
          }
        ],
        erasureRequested: false,
        legalBasis: 'legitimate_interest',
        retentionExpiry: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) as any, // 2 years from now
        autoDeleteScheduled: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) as any,
        lastUpdated: new Date() as any
      }
      
      setGdprData(mockGdprData)
      
      // TODO: Load actual flag summary
      const mockFlagSummary: PatientFlagSummary = {
        patientId,
        patientName,
        totalFlags: 2,
        activeFlags: 1,
        resolvedFlags: 1,
        flagsBySeverity: { low: 1, medium: 1, high: 0 },
        riskLevel: 'low',
        consentToTracking: true,
        canBeContacted: true,
        lastUpdated: new Date() as any
      }
      
      setFlagSummary(mockFlagSummary)
    } catch (error) {
      console.error('Error loading GDPR data:', error)
      setError('Nu s-au putut încărca datele de conformitate GDPR')
    } finally {
      setLoading(false)
    }
  }
  
  /**
   * Handle GDPR action execution
   */
  const handleGDPRAction = async (action: GDPRAction) => {
    try {
      setProcessing(action.type)
      setError(null)
      
      switch (action.type) {
        case 'access':
          await handleDataAccess()
          break
        case 'rectification':
          await handleDataRectification()
          break
        case 'erasure':
          await handleDataErasure()
          break
        case 'portability':
          await handleDataPortability()
          break
        case 'restrict':
          await handleProcessingRestriction()
          break
      }
      
      setShowConfirmDialog({ isOpen: false, action: null })
    } catch (error) {
      console.error(`Error executing GDPR action ${action.type}:`, error)
      setError(`Nu s-a putut executa acțiunea: ${error instanceof Error ? error.message : 'Eroare necunoscută'}`)
    } finally {
      setProcessing(null)
    }
  }
  
  /**
   * Handle data access request
   */
  const handleDataAccess = async () => {
    // TODO: Implement actual data export
    const exportData = {
      personalInfo: {
        patientId,
        patientName,
        exportDate: new Date().toISOString()
      },
      flaggingData: flagSummary,
      gdprCompliance: gdprData,
      dataProcessingHistory: [
        {
          action: 'Flag created',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          reason: 'No response to appointment notifications',
          legalBasis: 'Legitimate interest'
        }
      ]
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Download the data
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medflow-gdpr-export-${patientId}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    onDataExported?.(exportData)
  }
  
  /**
   * Handle data rectification request
   */
  const handleDataRectification = async () => {
    // TODO: Implement actual rectification request
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Data rectification requested for patient:', patientId)
    
    // Update GDPR data
    if (gdprData) {
      const updatedData = {
        ...gdprData,
        dataAccessRequests: [
          ...gdprData.dataAccessRequests,
          {
            requestDate: new Date() as any,
            requestType: 'rectification' as const
          }
        ],
        lastUpdated: new Date() as any
      }
      setGdprData(updatedData)
    }
  }
  
  /**
   * Handle data erasure request
   */
  const handleDataErasure = async () => {
    // TODO: Implement actual data erasure
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('Data erasure requested for patient:', patientId)
    
    onDataDeleted?.()
  }
  
  /**
   * Handle data portability request
   */
  const handleDataPortability = async () => {
    // TODO: Implement portable data export
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const portableData = {
      schema: 'MedFlow-GDPR-v1.0',
      exportDate: new Date().toISOString(),
      patient: {
        id: patientId,
        name: patientName
      },
      flags: flagSummary,
      compliance: gdprData
    }
    
    const blob = new Blob([JSON.stringify(portableData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `medflow-portable-export-${patientId}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  /**
   * Handle processing restriction request
   */
  const handleProcessingRestriction = async () => {
    // TODO: Implement processing restriction
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Processing restriction requested for patient:', patientId)
    
    // Update GDPR data
    if (gdprData) {
      const updatedData = {
        ...gdprData,
        dataAccessRequests: [
          ...gdprData.dataAccessRequests,
          {
            requestDate: new Date() as any,
            requestType: 'restrict' as any
          }
        ],
        lastUpdated: new Date() as any
      }
      setGdprData(updatedData)
    }
  }
  
  /**
   * Get status color for compliance item
   */
  const getStatusColor = (status: boolean) => {
    return status 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100'
  }
  
  /**
   * Render loading state
   */
  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner size="lg" className="mr-3" />
        <span className="text-gray-600">Se încarcă datele de conformitate GDPR...</span>
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
  
  if (!gdprData) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">Nu există date de conformitate GDPR</p>
      </div>
    )
  }
  
  return (
    <DesignWorkWrapper componentName="GDPRComplianceManager">
      <div className={`space-y-6 ${className}`}>
      {/* GDPR Status Overview */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Shield className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Conformitate GDPR - {patientName}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(gdprData.consentToFlagging)}`}>
              {gdprData.consentToFlagging ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Consimțământ acordat
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Fără consimțământ
                </>
              )}
            </div>
            <div className="text-xs text-gray-600 mt-2">Status consimțământ</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-900">
              {gdprData.legalBasis === 'legitimate_interest' ? 'Interes legitim' :
               gdprData.legalBasis === 'consent' ? 'Consimțământ' :
               gdprData.legalBasis === 'contract' ? 'Contract' : 'Obligație legală'}
            </div>
            <div className="text-xs text-gray-600 mt-2">Baza legală</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium text-gray-900">
              {format(gdprData.retentionExpiry.toDate(), 'dd MMM yyyy', { locale: ro })}
            </div>
            <div className="text-xs text-gray-600 mt-2">Expirare reținere</div>
          </div>
        </div>
      </div>
      
      {/* Data Processing History */}
      {gdprData.dataAccessRequests.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Istoric solicitări GDPR
          </h4>
          
          <div className="space-y-3">
            {gdprData.dataAccessRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">
                    {request.requestType === 'access' ? 'Acces la date' :
                     request.requestType === 'rectification' ? 'Rectificare' :
                     request.requestType === 'erasure' ? 'Ștergere' :
                     request.requestType === 'portability' ? 'Portabilitate' : 'Restricționare'}
                  </span>
                  <div className="text-sm text-gray-600">
                    Solicitată: {format(request.requestDate.toDate(), 'dd MMM yyyy HH:mm', { locale: ro })}
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.fulfilledDate 
                    ? 'text-green-600 bg-green-100' 
                    : 'text-orange-600 bg-orange-100'
                }`}>
                  {request.fulfilledDate ? 'Finalizată' : 'În procesare'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* GDPR Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">
          Drepturile dumneavoastră conform GDPR
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gdprActions.map((action) => (
            <div key={action.type} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  {action.icon}
                </div>
                
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 mb-1">
                    {action.title}
                  </h5>
                  <p className="text-sm text-gray-600 mb-3">
                    {action.description}
                  </p>
                  
                  <button
                    onClick={() => setShowConfirmDialog({ isOpen: true, action })}
                    disabled={processing === action.type}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {processing === action.type ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Se procesează...
                      </>
                    ) : (
                      action.actionButton
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog.isOpen && showConfirmDialog.action && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 mr-3">
                  {showConfirmDialog.action.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {showConfirmDialog.action.title}
                </h3>
              </div>
              
              <p className="text-gray-700 mb-6">
                {showConfirmDialog.action.confirmMessage}
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmDialog({ isOpen: false, action: null })}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={() => handleGDPRAction(showConfirmDialog.action!)}
                  disabled={!!processing}
                  className={`px-4 py-2 text-white rounded transition-colors ${
                    showConfirmDialog.action.type === 'erasure'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {processing ? 'Se procesează...' : 'Confirmă'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </DesignWorkWrapper>
  )
}
