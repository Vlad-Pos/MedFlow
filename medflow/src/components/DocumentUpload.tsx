/**
 * Enhanced Document Upload Component for MedFlow
 * 
 * Features:
 * - Professional medical document upload with drag & drop
 * - Firebase Storage integration with progress tracking
 * - Comprehensive file validation and error handling
 * - MedFlow branding with professional styling
 * - Responsive design and accessibility support
 * - AI integration placeholders for document analysis
 * - Secure file handling with metadata management
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useRef, useCallback } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage, db } from '../services/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Image, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Brain,
  Shield,
  FileCheck,
  Trash2
} from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '../providers/AuthProvider'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface DocumentUploadProps {
  appointmentId: string
  onUploadComplete?: (document: DocumentMetadata) => void
  maxFileSize?: number // in MB
  allowedTypes?: string[]
  multiple?: boolean
}

interface DocumentMetadata {
  id: string
  appointmentId: string
  uploaderId: string
  fileUrl: string
  fileName: string
  contentType: string
  size: number
  createdAt: any
  scanResults?: {
    isValid: boolean
    fileType: string
    hasVirus: boolean
    aiAnalysis?: string
  }
}

interface UploadState {
  file: File | null
  progress: number | null
  error: string | null
  success: string | null
  uploading: boolean
  dragActive: boolean
}

export default function DocumentUpload({ 
  appointmentId, 
  onUploadComplete,
  maxFileSize = 10, // 10MB default
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  multiple = false
}: DocumentUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: null,
    error: null,
    success: null,
    uploading: false,
    dragActive: false
  })

  // Enhanced file validation
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return { 
        isValid: false, 
        error: `Fișierul este prea mare. Dimensiunea maximă permisă este ${maxFileSize}MB.` 
      }
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const allowedExtensions = allowedTypes.map(type => {
        switch (type) {
          case 'application/pdf': return 'PDF'
          case 'image/jpeg':
          case 'image/jpg': return 'JPEG'
          case 'image/png': return 'PNG'
          default: return type
        }
      }).join(', ')
      
      return { 
        isValid: false, 
        error: `Tipul de fișier nu este permis. Tipuri acceptate: ${allowedExtensions}.` 
      }
    }

    // Check file name for security
    const suspiciousPattern = /[<>:"/\\|?*\x00-\x1f]/
    if (suspiciousPattern.test(file.name)) {
      return { 
        isValid: false, 
        error: 'Numele fișierului conține caractere nevalide.' 
      }
    }

    return { isValid: true }
  }, [maxFileSize, allowedTypes])

  // AI Document Analysis Placeholder
  const analyzeDocument = useCallback(async (file: File) => {
    // AI Placeholder: This will be enhanced with actual AI document analysis
    return {
      isValid: true,
      fileType: file.type,
      hasVirus: false,
      aiAnalysis: '🤖 Analiza AI a documentului va fi disponibilă în curând'
    }
  }, [])

  // Enhanced file upload handler
  const uploadFile = useCallback(async (file: File) => {
    if (!user) {
      setUploadState(prev => ({ ...prev, error: 'Utilizatorul nu este autentificat.' }))
      return
    }

    const validation = validateFile(file)
    if (!validation.isValid) {
      setUploadState(prev => ({ ...prev, error: validation.error || 'Fișier invalid.' }))
      return
    }

    setUploadState(prev => ({ 
      ...prev, 
      file, 
      uploading: true, 
      error: null, 
      success: null, 
      progress: 0 
    }))

    try {
      // AI document analysis
      const scanResults = await analyzeDocument(file)
      
      if (!scanResults.isValid) {
        setUploadState(prev => ({ 
          ...prev, 
          error: 'Documentul nu a trecut verificarea de securitate.',
          uploading: false 
        }))
        return
      }

      // Create secure file path
      const timestamp = Date.now()
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const path = `appointments/${appointmentId}/${timestamp}_${sanitizedFileName}`
      const storageRef = ref(storage, path)
      
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: {
          uploaderId: user.uid,
          appointmentId,
          originalName: file.name,
          scanTimestamp: timestamp.toString()
        }
      })

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          setUploadState(prev => ({ ...prev, progress }))
        },
        (error) => {
          console.error('Upload error:', error)
          let errorMessage = 'Încărcarea a eșuat. Vă rugăm să încercați din nou.'
          
          if (error.code === 'storage/unauthorized') {
            errorMessage = 'Nu aveți permisiunea să încărcați fișiere.'
          } else if (error.code === 'storage/canceled') {
            errorMessage = 'Încărcarea a fost anulată.'
          } else if (error.code === 'storage/quota-exceeded') {
            errorMessage = 'Spațiul de stocare este plin.'
          }
          
          setUploadState(prev => ({ 
            ...prev, 
            error: errorMessage, 
            uploading: false, 
            progress: null 
          }))
        },
        async () => {
          try {
            // Get download URL
            const fileUrl = await getDownloadURL(uploadTask.snapshot.ref)
            
            // Save metadata to Firestore
            const documentData = {
              appointmentId,
              uploaderId: user.uid,
              fileUrl,
              fileName: file.name,
              contentType: file.type,
              size: file.size,
              createdAt: serverTimestamp(),
              scanResults,
              storagePath: path
            }
            
            const docRef = await addDoc(collection(db, 'documents'), documentData)
            
            const documentMetadata: DocumentMetadata = {
              id: docRef.id,
              ...documentData,
              createdAt: new Date()
            }
            
            setUploadState(prev => ({ 
              ...prev, 
              success: 'Document încărcat cu succes!',
              uploading: false,
              progress: null,
              file: null
            }))
            
            // Notify parent component
            onUploadComplete?.(documentMetadata)
            
            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            
          } catch (firestoreError) {
            console.error('Firestore error:', firestoreError)
            
            // Clean up uploaded file if Firestore save fails
            try {
              await deleteObject(uploadTask.snapshot.ref)
            } catch (deleteError) {
              console.error('Error cleaning up file:', deleteError)
            }
            
            setUploadState(prev => ({ 
              ...prev, 
              error: 'Eroare la salvarea metadatelor documentului.',
              uploading: false,
              progress: null 
            }))
          }
        }
      )
      
    } catch (error) {
      console.error('Document upload error:', error)
      setUploadState(prev => ({ 
        ...prev, 
        error: 'A apărut o eroare neașteptată.',
        uploading: false,
        progress: null 
      }))
    }
  }, [user, appointmentId, validateFile, analyzeDocument, onUploadComplete])

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setUploadState(prev => ({ ...prev, dragActive: true }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setUploadState(prev => ({ ...prev, dragActive: false }))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setUploadState(prev => ({ ...prev, dragActive: false }))
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadFile(files[0]) // Handle first file for now
    }
  }, [uploadFile])

  // File input change handler
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }, [uploadFile])

  // Get file type icon
  const getFileIcon = useCallback((contentType: string) => {
    if (contentType === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />
    } else if (contentType.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />
    }
    return <FileCheck className="w-8 h-8 text-gray-500" />
  }, [])

  return (
    <DesignWorkWrapper componentName="DocumentUpload">
      <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          uploadState.dragActive
            ? 'border-medflow-primary bg-medflow-primary/5'
            : uploadState.uploading
            ? 'border-medflow-primary bg-medflow-primary/5'
            : 'border-gray-300 dark:border-gray-600 hover:border-medflow-primary hover:bg-medflow-primary/5'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileChange}
          disabled={uploadState.uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          multiple={multiple}
        />

        <div className="space-y-4">
          {uploadState.uploading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-medflow-primary">
                  Se încarcă documentul...
                </h4>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <motion.div
                    className="bg-medflow-primary h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadState.progress || 0}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {uploadState.progress}% - {uploadState.file?.name}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex justify-center">
                <motion.div
                  className="p-4 bg-medflow-primary/10 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Upload className="w-8 h-8 text-medflow-primary" />
                </motion.div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {uploadState.dragActive ? 'Eliberați pentru încărcare' : 'Încărcați document medical'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Glisați și plasați sau faceți clic pentru a selecta fișiere
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Tipuri acceptate: PDF, JPEG, PNG (max. {maxFileSize}MB)
                </p>
              </div>

              {/* Security & AI Notice */}
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Securizat</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Brain className="w-3 h-3" />
                  <span>🤖 Analiză AI</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Status Messages */}
      <AnimatePresence>
        {uploadState.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-red-800 dark:text-red-300">
                Eroare la încărcare
              </h5>
              <p className="text-sm text-red-700 dark:text-red-400">
                {uploadState.error}
              </p>
            </div>
            <button
              onClick={() => setUploadState(prev => ({ ...prev, error: null }))}
              className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploadState.success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-800"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-emerald-800 dark:text-emerald-300">
                Încărcare reușită
              </h5>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {uploadState.success}
              </p>
            </div>
            <button
              onClick={() => setUploadState(prev => ({ ...prev, success: null }))}
              className="ml-auto p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-emerald-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Analysis Placeholder */}
      <div className="bg-medflow-primary/5 border border-medflow-primary/10 rounded-lg p-4">
        <div className="flex items-center space-x-3 text-medflow-primary">
          <Brain className="w-4 h-4" />
          <span className="text-sm font-medium">
            🤖 Funcționalități AI pentru analiza documentelor medicale vor fi disponibile în curând
          </span>
        </div>
      </div>
    </div>
    </DesignWorkWrapper>
  )
}