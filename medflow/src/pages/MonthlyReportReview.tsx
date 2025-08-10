/**
 * Monthly Report Review Page for MedFlow
 * 
 * Comprehensive interface for reviewing and managing finalized reports before government submission:
 * - Monthly report aggregation with advanced filtering
 * - Bulk review and approval operations
 * - Amendment workflow management
 * - Submission batch preparation
 * - Compliance and audit tracking
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Eye,
  Edit,
  Send,
  Download,
  RefreshCw,
  CheckSquare,
  Square,
  Users,
  TrendingUp,
  Archive,
  Flag,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Settings,
  X,
  Activity
} from 'lucide-react'
import {
  PatientReport,
  MonthlyReportFilters,
  MonthlyReportSummary,
  SubmissionBatch,
  AmendmentRequest,
  SubmissionStatus,
  AmendmentStatus
} from '../types/patientReports'
import {
  getMonthlyReportSummary,
  getMonthlyReports,
  subscribeToMonthlyReports,
  markReportReadyForSubmission,
  createSubmissionBatch,
  bulkApproveReports,
  getAvailableMonths,
  getSubmissionDeadline,
  isMonthOverdue
} from '../services/monthlyReports'
import {
  queueSubmissionBatch,
  getSubmissionStatistics
} from '../services/governmentSubmission'
import SubmissionStatusManager from '../components/SubmissionStatusManager'
import { useAuth } from '../providers/AuthProvider'
import LoadingSpinner from '../components/LoadingSpinner'
import { showNotification } from '../components/Notification'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { formatDateTime } from '../utils/dateUtils'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface SelectedReports {
  [key: string]: boolean
}

interface FilterState extends MonthlyReportFilters {
  searchQuery: string
  selectedStatuses: string[]
  showOnlyNeedsReview: boolean
  showOnlyWithAmendments: boolean
}

export default function MonthlyReportReview() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [monthlyReports, setMonthlyReports] = useState<PatientReport[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlyReportSummary | null>(null)
  const [selectedReports, setSelectedReports] = useState<SelectedReports>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    month: '',
    searchQuery: '',
    selectedStatuses: [],
    showOnlyNeedsReview: false,
    showOnlyWithAmendments: false,
    includeSubmitted: false
  })

  // Dialog states
  const [bulkApprovalDialog, setBulkApprovalDialog] = useState<{
    isOpen: boolean
    reportIds: string[]
    loading: boolean
  }>({
    isOpen: false,
    reportIds: [],
    loading: false
  })

  const [submissionDialog, setSubmissionDialog] = useState<{
    isOpen: boolean
    reportIds: string[]
    loading: boolean
  }>({
    isOpen: false,
    reportIds: [],
    loading: false
  })

  const [submissionStatusDialog, setSubmissionStatusDialog] = useState<{
    isOpen: boolean
    batchId: string | null
  }>({
    isOpen: false,
    batchId: null
  })

  const [isWithinSubmissionPeriod, setIsWithinSubmissionPeriod] = useState(false)

  // Check submission period
  useEffect(() => {
    const checkPeriod = () => {
      // Check if current date is within submission period (5th-10th of month)
      const now = new Date()
      const day = now.getDate()
      setIsWithinSubmissionPeriod(day >= 5 && day <= 10)
    }

    checkPeriod()
    const interval = setInterval(checkPeriod, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  // Initialize available months
  useEffect(() => {
    if (!user) return

    const loadAvailableMonths = async () => {
      try {
        const months = await getAvailableMonths(user.uid)
        setAvailableMonths(months)
        
        if (months.length > 0 && !selectedMonth) {
          setSelectedMonth(months[0]) // Most recent month
        }
      } catch (error) {
        console.error('Error loading available months:', error)
        showNotification.error('Eroare la încărcarea lunilor disponibile')
      }
    }

    loadAvailableMonths()
  }, [user, selectedMonth])

  // Load monthly data when month changes
  useEffect(() => {
    if (!user || !selectedMonth) return

    setFilters(prev => ({ ...prev, month: selectedMonth }))
    
    const loadMonthlyData = async () => {
      setIsLoading(true)
      try {
        // Load summary
        const summary = await getMonthlyReportSummary(user.uid, selectedMonth)
        setMonthlySummary(summary)

        // Load reports
        const { reports } = await getMonthlyReports(user.uid, {
          month: selectedMonth,
          includeSubmitted: filters.includeSubmitted
        })
        setMonthlyReports(reports)
      } catch (error) {
        console.error('Error loading monthly data:', error)
        showNotification.error('Eroare la încărcarea datelor lunare')
      } finally {
        setIsLoading(false)
      }
    }

    loadMonthlyData()
  }, [user, selectedMonth, filters.includeSubmitted])

  // Real-time subscription
  useEffect(() => {
    if (!user || !selectedMonth) return

    const unsubscribe = subscribeToMonthlyReports(user.uid, selectedMonth, (reports) => {
      setMonthlyReports(reports)
    })

    return unsubscribe
  }, [user, selectedMonth])

  // Filter reports based on current filters
  const filteredReports = useMemo(() => {
    let filtered = monthlyReports

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(report =>
        report.patientName.toLowerCase().includes(query) ||
        report.diagnosis.primary.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.selectedStatuses.length > 0) {
      filtered = filtered.filter(report =>
        filters.selectedStatuses.includes(report.status)
      )
    }

    // Needs review filter
    if (filters.showOnlyNeedsReview) {
      filtered = filtered.filter(report =>
        report.status === 'final' && !report.isReadyForSubmission
      )
    }

    // Amendments filter
    if (filters.showOnlyWithAmendments) {
      filtered = filtered.filter(report =>
        report.amendmentStatus !== 'none'
      )
    }

    return filtered.sort((a, b) => {
      // Prioritize reports needing review
      const aNeedsReview = a.status === 'final' && !a.isReadyForSubmission
      const bNeedsReview = b.status === 'final' && !b.isReadyForSubmission
      
      if (aNeedsReview && !bNeedsReview) return -1
      if (!aNeedsReview && bNeedsReview) return 1
      
      // Then by creation date
      return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
    })
  }, [monthlyReports, filters])

  const handleSelectAll = () => {
    const allSelected = filteredReports.every(report => selectedReports[report.id])
    const newSelection: SelectedReports = {}
    
    if (!allSelected) {
      filteredReports.forEach(report => {
        newSelection[report.id] = true
      })
    }
    
    setSelectedReports(newSelection)
  }

  const handleSelectReport = (reportId: string) => {
    setSelectedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }))
  }

  const selectedReportIds = Object.keys(selectedReports).filter(id => selectedReports[id])
  const selectedCount = selectedReportIds.length

  const handleBulkApproval = async () => {
    try {
      await bulkApproveReports(selectedReportIds, user!.uid)
      showNotification.success('Rapoartele au fost aprobate cu succes')
      // Refresh data by calling the same logic as loadMonthlyData
      if (user && selectedMonth) {
        const summary = await getMonthlyReportSummary(user.uid, selectedMonth)
        setMonthlySummary(summary)
        const reports = await getMonthlyReports(user.uid, selectedMonth, filters)
        setMonthlyReports(reports)
      }
      setSelectedReports({}) // Clear selections
    } catch (error) {
      console.error('Error during bulk approval:', error)
      showNotification.error('Eroare la aprobarea în masă')
    }
  }

  const handleBulkApprovalConfirm = async () => {
    if (!user) return

    setBulkApprovalDialog(prev => ({ ...prev, loading: true }))

    try {
      await bulkApproveReports(bulkApprovalDialog.reportIds, user.uid, 'doctor')
      showNotification(`${bulkApprovalDialog.reportIds.length} rapoarte aprobate cu succes`, 'success')
      setSelectedReports({})
      setBulkApprovalDialog({ isOpen: false, reportIds: [], loading: false })
    } catch (error) {
      console.error('Error bulk approving:', error)
      showNotification('Eroare la aprobarea în masă', 'error')
      setBulkApprovalDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const handleCreateSubmissionBatch = async () => {
    const readyReports = selectedReportIds.filter(id => {
      const report = monthlyReports.find(r => r.id === id)
      return report && report.isReadyForSubmission
    })

    if (readyReports.length === 0) {
      showNotification('Nu există rapoarte pregătite pentru trimitere', 'warning')
      return
    }

    setSubmissionDialog({
      isOpen: true,
      reportIds: readyReports,
      loading: false
    })
  }

  const handleSubmissionConfirm = async () => {
    if (!user || !selectedMonth) return

    setSubmissionDialog(prev => ({ ...prev, loading: true }))

    try {
      const batchId = await createSubmissionBatch(
        selectedMonth,
        submissionDialog.reportIds,
        user.uid,
        `Lot de trimitere pentru luna ${selectedMonth}`
      )
      
      // Queue for automatic submission if within period
      if (isWithinSubmissionPeriod) {
        await queueSubmissionBatch(batchId, 'manual', 'high')
        showNotification(`Lot creat și programat pentru trimitere (${batchId})`, 'success')
      } else {
        showNotification(`Lot de trimitere creat (${batchId}). Va fi trimis în perioada 5-10 ale lunii.`, 'info')
      }
      
      setSelectedReports({})
      setSubmissionDialog({ isOpen: false, reportIds: [], loading: false })
      
      // Show submission status
      setSubmissionStatusDialog({ isOpen: true, batchId })
    } catch (error) {
      console.error('Error creating submission batch:', error)
      showNotification('Eroare la crearea lotului de trimitere', 'error')
      setSubmissionDialog(prev => ({ ...prev, loading: false }))
    }
  }

  const handleRefresh = async () => {
    if (!user || !selectedMonth) return

    setIsRefreshing(true)
    try {
      const summary = await getMonthlyReportSummary(user.uid, selectedMonth)
      setMonthlySummary(summary)
      showNotification('Datele au fost actualizate', 'success')
    } catch (error) {
      console.error('Error refreshing:', error)
      showNotification('Eroare la actualizare', 'error')
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'final': return <Clock className="w-4 h-4" />
      case 'ready_for_submission': return <CheckCircle className="w-4 h-4" />
      case 'submitted': return <Send className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'ready_for_submission': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getSubmissionStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'ready': return 'text-green-600'
      case 'submitted': return 'text-blue-600'
      case 'accepted': return 'text-emerald-600'
      case 'rejected': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Se încarcă datele lunare...
          </p>
        </div>
      </div>
    )
  }

  return (
    <DesignWorkWrapper componentName="MonthlyReportReview">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Revizuire Rapoarte Lunare
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestionează și pregătește rapoartele pentru trimiterea către autorități
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-800 dark:text-white"
            >
              <option value="">Selectează luna</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('ro-RO', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </option>
              ))}
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualizează</span>
            </button>
          </div>
        </div>

        {!selectedMonth ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Selectează o lună pentru revizuire
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Alege luna pentru care dorești să revizuiești rapoartele medicale.
            </p>
          </div>
        ) : (
          <>
            {/* Monthly Summary Cards */}
            {monthlySummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Rapoarte finalizate
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {monthlySummary.finalizedReports}
                      </p>
                      <p className="text-xs text-gray-500">
                        din {monthlySummary.totalReports} total
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Pregătite pentru trimitere
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {monthlySummary.readyForSubmission}
                      </p>
                      <p className="text-xs text-gray-500">
                        {monthlySummary.reviewProgress.toFixed(1)}% revizuite
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Amendamente în curs
                      </p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {monthlySummary.pendingAmendments}
                      </p>
                      <p className="text-xs text-gray-500">
                        necesită atenție
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <Edit className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Termen limită
                      </p>
                      <p className={`text-2xl font-bold ${isMonthOverdue(selectedMonth) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {monthlySummary.submissionDeadline ? 
                          monthlySummary.submissionDeadline.toLocaleDateString('ro-RO', { 
                            day: 'numeric', 
                            month: 'short' 
                          }) : 
                          'N/A'
                        }
                      </p>
                      <p className={`text-xs ${isMonthOverdue(selectedMonth) ? 'text-red-500' : 'text-gray-500'}`}>
                        {isMonthOverdue(selectedMonth) ? 'Expirat' : 'Până la trimitere'}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isMonthOverdue(selectedMonth) 
                        ? 'bg-red-100 dark:bg-red-900/20' 
                        : 'bg-orange-100 dark:bg-orange-900/20'
                    }`}>
                      <Clock className={`w-6 h-6 ${
                        isMonthOverdue(selectedMonth) ? 'text-red-600' : 'text-orange-600'
                      }`} />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Caută după pacient sau diagnostic..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtre</span>
                </button>

                {/* Selection Info */}
                {selectedCount > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckSquare className="w-4 h-4" />
                    <span>{selectedCount} selectate</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {selectedCount > 0 && (
                  <>
                    <button
                      onClick={handleBulkApproval}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Aprobă {selectedCount}</span>
                    </button>

                    <button
                      onClick={handleCreateSubmissionBatch}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Creează lot de trimitere</span>
                    </button>
                    
                    <button
                      onClick={() => setSubmissionStatusDialog({ isOpen: true, batchId: null })}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Status trimiteri</span>
                    </button>
                  </>
                )}

                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {filteredReports.every(report => selectedReports[report.id]) ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <CheckSquare className="w-4 h-4" />
                  )}
                  <span>Selectează toate</span>
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Status rapoarte
                      </label>
                      <select
                        multiple
                        value={filters.selectedStatuses}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value)
                          setFilters(prev => ({ ...prev, selectedStatuses: values }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medflow-primary dark:bg-gray-700 dark:text-white"
                      >
                        <option value="final">Finalizat</option>
                        <option value="ready_for_submission">Pregătit pentru trimitere</option>
                        <option value="submitted">Trimis</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filtre rapide
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.showOnlyNeedsReview}
                          onChange={(e) => setFilters(prev => ({ ...prev, showOnlyNeedsReview: e.target.checked }))}
                          className="rounded border-gray-300 text-medflow-primary focus:ring-medflow-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Doar cele ce necesită revizuire
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.showOnlyWithAmendments}
                          onChange={(e) => setFilters(prev => ({ ...prev, showOnlyWithAmendments: e.target.checked }))}
                          className="rounded border-gray-300 text-medflow-primary focus:ring-medflow-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Doar cu amendamente
                        </span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.includeSubmitted}
                          onChange={(e) => setFilters(prev => ({ ...prev, includeSubmitted: e.target.checked }))}
                          className="rounded border-gray-300 text-medflow-primary focus:ring-medflow-primary"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Include rapoartele trimise
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reports List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {filteredReports.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Nu există rapoarte pentru luna selectată
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedMonth ? 
                      `Nu s-au găsit rapoarte pentru ${new Date(selectedMonth + '-01').toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}` :
                      'Selectează o lună pentru a vedea rapoartele disponibile'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        selectedReports[report.id] ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedReports[report.id] || false}
                            onChange={() => handleSelectReport(report.id)}
                            className="rounded border-gray-300 text-medflow-primary focus:ring-medflow-primary"
                          />

                          {/* Report Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {report.patientName}
                              </h3>
                              
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                {getStatusIcon(report.status)}
                                <span>
                                  {report.status === 'final' ? 'Finalizat' :
                                   report.status === 'ready_for_submission' ? 'Pregătit' :
                                   report.status === 'submitted' ? 'Trimis' : report.status}
                                </span>
                              </span>

                              {report.amendmentStatus !== 'none' && (
                                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                                  <Edit className="w-3 h-3" />
                                  <span>
                                    {report.amendmentStatus === 'pending' ? 'Amendament în curs' :
                                     report.amendmentStatus === 'approved' ? 'Amendament aprobat' :
                                     'Amendament respins'}
                                  </span>
                                </span>
                              )}

                              {report.status === 'final' && !report.isReadyForSubmission && (
                                <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Necesită revizuire</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>Diagnostic: {report.diagnosis.primary}</span>
                              <span>•</span>
                              <span>Creat: {formatDateTime(report.createdAt.toDate())}</span>
                              {report.reviewedAt && (
                                <>
                                  <span>•</span>
                                  <span>Revizuit: {formatDateTime(report.reviewedAt.toDate())}</span>
                                </>
                              )}
                            </div>

                            {/* Submission Status */}
                            <div className="mt-2">
                              <span className={`text-sm font-medium ${getSubmissionStatusColor(report.submissionStatus)}`}>
                                Status trimitere: {
                                  report.submissionStatus === 'not_ready' ? 'Nu este pregătit' :
                                  report.submissionStatus === 'ready' ? 'Pregătit' :
                                  report.submissionStatus === 'submitted' ? 'Trimis' :
                                  report.submissionStatus === 'accepted' ? 'Acceptat' :
                                  report.submissionStatus === 'rejected' ? 'Respins' :
                                  report.submissionStatus
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="Vezi detalii"
                          >
                            {expandedReport === report.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="Vezi raportul"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {report.status === 'final' && !report.isReadyForSubmission && (
                            <button
                              onClick={() => markReportReadyForSubmission(report.id, user!.uid)}
                              className="p-2 text-green-500 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Marchează ca pregătit pentru trimitere"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {(report.status === 'final' || report.status === 'ready_for_submission') && (
                            <button
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Creează amendament"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            title="Descarcă raportul"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedReport === report.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Plângerea pacientului</h4>
                                <p className="text-gray-600 dark:text-gray-400">{report.patientComplaint}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tratament prescris</h4>
                                <div className="space-y-1">
                                  {report.prescribedMedications.map((med, i) => (
                                    <p key={i} className="text-gray-600 dark:text-gray-400">
                                      {med.name} - {med.dosage} - {med.frequency}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Bulk Approval Dialog */}
        <ConfirmationDialog
          isOpen={bulkApprovalDialog.isOpen}
          onClose={() => setBulkApprovalDialog({ isOpen: false, reportIds: [], loading: false })}
          onConfirm={handleBulkApprovalConfirm}
          title="Confirmă aprobarea în masă"
          message={`Ești sigur că vrei să aprobi ${bulkApprovalDialog.reportIds.length} rapoarte pentru trimitere? Acestea vor fi marcate ca pregătite pentru submisia către autorități.`}
          confirmText="Aprobă toate"
          cancelText="Anulează"
          type="success"
          loading={bulkApprovalDialog.loading}
        />

        {/* Submission Dialog */}
        <ConfirmationDialog
          isOpen={submissionDialog.isOpen}
          onClose={() => setSubmissionDialog({ isOpen: false, reportIds: [], loading: false })}
          onConfirm={handleSubmissionConfirm}
          title="Creează lot de trimitere"
          message={`Ești sigur că vrei să creezi un lot de trimitere cu ${submissionDialog.reportIds.length} rapoarte? ${
            isWithinSubmissionPeriod 
              ? 'Lotul va fi trimis automat către autoritatea sanitară.'
              : 'Lotul va fi programat pentru trimitere în perioada 5-10 ale lunii.'
          }`}
          confirmText="Creează lotul"
          cancelText="Anulează"
          type="primary"
          loading={submissionDialog.loading}
        />

        {/* Submission Status Dialog */}
        <AnimatePresence>
          {submissionStatusDialog.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSubmissionStatusDialog({ isOpen: false, batchId: null })}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Status Trimiteri Guvern
                  </h2>
                  <button
                    onClick={() => setSubmissionStatusDialog({ isOpen: false, batchId: null })}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <SubmissionStatusManager
                    batchId={submissionStatusDialog.batchId || undefined}
                    showFullInterface={true}
                    onClose={() => setSubmissionStatusDialog({ isOpen: false, batchId: null })}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DesignWorkWrapper>
  )
}
