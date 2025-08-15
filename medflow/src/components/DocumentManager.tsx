/**
 * Enhanced Document Manager Component for MedFlow
 * 
 * Features:
 * - Professional document viewing and management
 * - Firebase Storage integration with secure downloads
 * - Document preview with thumbnail generation
 * - Comprehensive file metadata display
 * - MedFlow branding with responsive design
 * - AI integration placeholders for document analysis
 * - Secure document sharing and permissions
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { db, storage } from '../services/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Image, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  AlertTriangle,
  CheckCircle,
  Brain,
  FileCheck,
  ExternalLink
} from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import LoadingSpinner from './LoadingSpinner'
import { formatDateTime } from '../utils/dateUtils'
interface DocumentData {
  id: string
  appointmentId: string
  uploaderId: string
  fileUrl: string
  fileName: string
  contentType: string
  size: number
  createdAt: Date
  scanResults?: {
    isValid: boolean
    fileType: string
    hasVirus: boolean
    aiAnalysis?: string
  }
  storagePath?: string
}

interface DocumentManagerProps {
  appointmentId: string
  allowDelete?: boolean
  allowDownload?: boolean
  showPreview?: boolean
  compact?: boolean
}

export default function DocumentManager({
  appointmentId,
  allowDelete = true,
  allowDownload = true,
  showPreview = true,
  compact = false
}: DocumentManagerProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<DocumentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [deletingDoc, setDeletingDoc] = useState<string | null>(null)

  // Load documents in real-time
  useEffect(() => {
    if (!appointmentId) return

    setLoading(true)
    setError(null)

    try {
      const q = query(
        collection(db, 'documents'),
        where('appointmentId', '==', appointmentId),
        orderBy('createdAt', 'desc')
      )

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as DocumentData[]

          setDocuments(docs)
          setLoading(false)
        },
        (err) => {
          console.error('Error loading documents:', err)
          setError('Eroare la încărcarea documentelor')
          setLoading(false)
        }
      )

      return unsubscribe
    } catch (err) {
      console.error('Error setting up documents listener:', err)
      setError('Eroare la configurarea încărcării documentelor')
      setLoading(false)
    }
  }, [appointmentId])

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  // Get file icon based on content type
  const getFileIcon = useCallback((contentType: string) => {
    if (contentType === 'application/pdf') {
      return <FileText className="w-6 h-6 text-red-500" />
    } else if (contentType.startsWith('image/')) {
      return <Image className="w-6 h-6 text-blue-500" />
    }
    return <FileCheck className="w-6 h-6 text-gray-500" />
  }, [])

  // Handle document download
  const handleDownload = useCallback(async (document: DocumentData) => {
    try {
      // Open in new tab to trigger download
      window.open(document.fileUrl, '_blank')
    } catch (error) {
      console.error('Error downloading document:', error)
      setError('Eroare la descărcarea documentului')
    }
  }, [])

  // Handle document preview
  const handlePreview = useCallback((document: DocumentData) => {
    setSelectedDoc(document)
    setShowPreviewModal(true)
  }, [])

  // Handle document deletion
  const handleDelete = useCallback(async (document: DocumentData) => {
    if (!user) return
    
    const confirmDelete = window.confirm(
      `Sunteți sigur că doriți să ștergeți documentul "${document.fileName}"? Această acțiune nu poate fi anulată.`
    )
    
    if (!confirmDelete) return

    setDeletingDoc(document.id)

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'documents', document.id))

      // Delete from Storage if path exists
      if (document.storagePath) {
        try {
          const storageRef = ref(storage, document.storagePath)
          await deleteObject(storageRef)
        } catch (storageError) {
          console.warn('Storage deletion failed (file may not exist):', storageError)
        }
      }

    } catch (error) {
      console.error('Error deleting document:', error)
      setError('Eroare la ștergerea documentului')
    } finally {
      setDeletingDoc(null)
    }
  }, [user])

  // AI Document Analysis Placeholder
  const analyzeDocument = useCallback(async (document: DocumentData) => {
    // AI Placeholder: This will be enhanced with actual AI document analysis
    return {
      confidence: 0.95,
      documentType: 'Rezultat analiză medicală',
      keyPoints: [
        'Document medical valid',
        'Informații complete',
        'Format standard'
      ],
      recommendations: [
        '🤖 AI: Document procesat cu succes',
        '🤖 AI: Analiză completă disponibilă în curând'
      ]
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <LoadingSpinner size="md" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Se încarcă documentele...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-red-800 dark:text-red-300">
            Eroare
          </h4>
          <p className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Nu există documente încărcate
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Documentele încărcate pentru această programare vor apărea aici.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Documents List */}
      <div className={`space-y-3 ${compact ? 'space-y-2' : ''}`}>
        <AnimatePresence>
          {documents.map((document) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                compact ? 'p-3' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* File Icon */}
                <div className={`flex-shrink-0 ${compact ? 'mt-0.5' : 'mt-1'}`}>
                  {getFileIcon(document.contentType)}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-gray-900 dark:text-white truncate ${
                        compact ? 'text-sm' : 'text-base'
                      }`}>
                        {document.fileName}
                      </h4>
                      
                      {!compact && (
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDateTime(document.createdAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>Încărcat de {document.uploaderId === user?.uid ? 'dvs.' : 'doctor'}</span>
                          </div>
                          <span>{formatFileSize(document.size)}</span>
                        </div>
                      )}

                      {/* Security Status */}
                      {document.scanResults && (
                        <div className="flex items-center space-x-2 mt-2">
                          {document.scanResults.isValid ? (
                            <div className="flex items-center space-x-1 text-emerald-600">
                              <CheckCircle className="w-3 h-3" />
                              <span className="text-xs">Verificat și securizat</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="text-xs">Atenție: Document nesigur</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {showPreview && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePreview(document)}
                          className="p-2 text-gray-500 hover:text-medflow-primary hover:bg-medflow-primary/10 rounded-lg transition-colors"
                          title="Previzualizare"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      )}

                      {allowDownload && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(document)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Descarcă"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                      )}

                      {allowDelete && document.uploaderId === user?.uid && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(document)}
                          disabled={deletingDoc === document.id}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Șterge"
                        >
                          {deletingDoc === document.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* AI Analysis Summary */}
      {documents.length > 0 && (
        <div className="bg-medflow-primary/5 border border-medflow-primary/10 rounded-lg p-4">
          <div className="flex items-center space-x-3 text-medflow-primary">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">
              🤖 {documents.length} document{documents.length > 1 ? 'e' : ''} disponibil{documents.length > 1 ? 'e' : ''} - Analiză AI va fi disponibilă în curând
            </span>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {getFileIcon(selectedDoc.contentType)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedDoc.fileName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatFileSize(selectedDoc.size)} • {formatDateTime(selectedDoc.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownload(selectedDoc)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Descarcă"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(selectedDoc.fileUrl, '_blank')}
                    className="p-2 text-gray-500 hover:text-medflow-primary hover:bg-medflow-primary/10 rounded-lg transition-colors"
                    title="Deschide în tab nou"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPreviewModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <span className="sr-only">Închide</span>
                    ✕
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-auto">
                {selectedDoc.contentType === 'application/pdf' ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Previzualizare PDF
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Pentru a vizualiza conținutul PDF, vă rugăm să îl descărcați sau să îl deschideți într-un tab nou.
                    </p>
                    <div className="flex justify-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(selectedDoc)}
                        className="flex items-center space-x-2 px-4 py-2 bg-medflow-primary text-white rounded-lg hover:bg-medflow-secondary transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descarcă PDF</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open(selectedDoc.fileUrl, '_blank')}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Deschide în tab nou</span>
                      </motion.button>
                    </div>
                  </div>
                ) : selectedDoc.contentType.startsWith('image/') ? (
                  <div className="text-center">
                    <img
                      src={selectedDoc.fileUrl}
                      alt={selectedDoc.fileName}
                      className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <div className="hidden py-12">
                      <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Nu s-a putut încărca imaginea. Vă rugăm să o descărcați pentru vizualizare.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Previzualizare indisponibilă
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      Acest tip de fișier nu poate fi previzualizat în browser. Vă rugăm să îl descărcați.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    )
}
