/**
 * Patient Reports Component for MedFlow
 * 
 * Features:
 * - Comprehensive patient report management
 * - AI-powered report generation and analysis
 * - Medical document templates and forms
 * - Export functionality (PDF, Word, etc.)
 * - Integration with appointment history
 * - Professional medical reporting
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Download, 
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  Share2,
  Brain,
  Printer,
  Mail,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  Stethoscope,
  Heart,
  Activity,
  TrendingUp,
  Star,
  X
} from 'lucide-react'
import { useAuth } from '../providers/AuthProvider'
import { staggerContainer, staggerItem, cardVariants, fadeInVariants } from '../utils/animations'
import LoadingSpinner from '../components/LoadingSpinner'

interface PatientReport {
  id: string
  patientName: string
  patientId: string
  reportType: 'consultation' | 'diagnosis' | 'treatment' | 'follow-up' | 'discharge'
  title: string
  date: Date
  doctorName: string
  status: 'draft' | 'completed' | 'sent' | 'archived'
  content: {
    symptoms: string[]
    diagnosis: string
    treatment: string
    recommendations: string[]
    followUp?: string
    medications?: string[]
  }
  attachments: string[]
  aiAnalysis?: {
    riskLevel: 'low' | 'medium' | 'high'
    insights: string[]
    recommendations: string[]
    confidence: number
  }
  createdAt: Date
  updatedAt: Date
}

const DEMO_REPORTS: PatientReport[] = [
  {
    id: '1',
    patientName: 'Ion Popescu',
    patientId: 'PAT001',
    reportType: 'consultation',
    title: 'Consultație cardiologică de rutină',
    date: new Date('2024-01-15'),
    doctorName: 'Dr. Maria Ionescu',
    status: 'completed',
    content: {
      symptoms: ['Palpitații', 'Dispnee de efort', 'Oboseală'],
      diagnosis: 'Hipertensiune arterială grad I',
      treatment: 'Medicație antihipertensivă, modificări stilului de viață',
      recommendations: [
        'Scăderea greutății corporale cu 5-10%',
        'Exerciții fizice regulate (30 min/zi)',
        'Reducerea consumului de sare',
        'Control medical la 3 luni'
      ],
      followUp: 'Control în 3 luni cu EKG și analize',
      medications: ['Lisinopril 10mg - 1x/zi', 'Aspirină 75mg - 1x/zi']
    },
    attachments: ['ekg_15012024.pdf', 'analize_12012024.pdf'],
    aiAnalysis: {
      riskLevel: 'medium',
      insights: [
        'Pacientul prezintă factori de risc cardiovascular',
        'Răspuns bun la tratament antihipertensiv',
        'Necesită monitorizare regulată'
      ],
      recommendations: [
        'Implementarea unui program de exerciții supravegheate',
        'Monitorizarea tensiunii arteriale acasă',
        'Evaluare echocardiografică la 6 luni'
      ],
      confidence: 85
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    patientName: 'Maria Georgescu',
    patientId: 'PAT002',
    reportType: 'diagnosis',
    title: 'Diagnostic și plan de tratament - Diabet zaharat tip 2',
    date: new Date('2024-01-12'),
    doctorName: 'Dr. Alexandru Popescu',
    status: 'completed',
    content: {
      symptoms: ['Poliurie', 'Polidipsie', 'Scădere în greutate', 'Oboseală'],
      diagnosis: 'Diabet zaharat tip 2, debut',
      treatment: 'Metformin, modificări dietetice, educație diabetologică',
      recommendations: [
        'Dietă hipoglucidică strictă',
        'Monitorizarea glicemiei acasă',
        'Activitate fizică regulată',
        'Educație pentru automonitorizare'
      ],
      followUp: 'Control săptămânal prima lună, apoi lunar',
      medications: ['Metformin 500mg - 2x/zi', 'Multivitamine - 1x/zi']
    },
    attachments: ['analize_diabet_12012024.pdf', 'plan_nutritional.pdf'],
    aiAnalysis: {
      riskLevel: 'high',
      insights: [
        'Debut de diabet la vârstă tânără',
        'Glicemie semnificativ crescută la diagnostic',
        'Risc crescut de complicații pe termen lung'
      ],
      recommendations: [
        'Consultație endocrinologică specializată',
        'Program intensiv de educație diabetologică',
        'Screening pentru complicații'
      ],
      confidence: 92
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  }
]

export default function PatientReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState<PatientReport[]>(DEMO_REPORTS)
  const [filteredReports, setFilteredReports] = useState<PatientReport[]>(DEMO_REPORTS)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReportType, setSelectedReportType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<PatientReport | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Filter reports based on search and filters
  useEffect(() => {
    let filtered = reports

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.content.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedReportType !== 'all') {
      filtered = filtered.filter(report => report.reportType === selectedReportType)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus)
    }

    setFilteredReports(filtered)
  }, [reports, searchTerm, selectedReportType, selectedStatus])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'completed': return 'text-green-600 bg-green-50 border-green-200'
      case 'sent': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return Stethoscope
      case 'diagnosis': return Activity
      case 'treatment': return Heart
      case 'follow-up': return Calendar
      case 'discharge': return CheckCircle
      default: return FileText
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleExportReport = (report: PatientReport, format: 'pdf' | 'word' | 'print') => {
    // Placeholder for export functionality
    console.log(`Exporting report ${report.id} as ${format}`)
  }

  const handleShareReport = (report: PatientReport) => {
    // Placeholder for sharing functionality
    console.log(`Sharing report ${report.id}`)
  }

  return (
    <motion.section
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
        className="space-y-6"
      >
        {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Rapoarte Medicale
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Gestionarea și analiza rapoartelor pacienților
            </p>
          </div>
        </div>
            
            <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Raport nou</span>
            </button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Caută rapoarte, pacienți sau diagnostice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="flex space-x-3">
          <select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">Toate tipurile</option>
            <option value="consultation">Consultații</option>
            <option value="diagnosis">Diagnostice</option>
            <option value="treatment">Tratamente</option>
            <option value="follow-up">Follow-up</option>
            <option value="discharge">Externări</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">Toate statusurile</option>
            <option value="draft">Draft</option>
            <option value="completed">Completate</option>
            <option value="sent">Trimise</option>
            <option value="archived">Arhivate</option>
          </select>
              </div>
            </motion.div>

      {/* AI Analytics Summary */}
            <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">AI Analize</h4>
          </div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {filteredReports.filter(r => r.aiAnalysis).length}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Rapoarte cu analiză AI
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Risc Mare</h4>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-2">
            {filteredReports.filter(r => r.aiAnalysis?.riskLevel === 'high').length}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pacienți cu risc crescut
                  </p>
                </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Îmbunătățiri</h4>
                </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {filteredReports.filter(r => r.status === 'completed').length}
              </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tratamente completate
                  </p>
                </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <Star className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Calitate</h4>
                </div>
          <div className="text-3xl font-bold text-yellow-600 mb-2">94%</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scor calitate rapoarte
          </p>
              </div>
            </motion.div>

      {/* Reports List */}
            <motion.div
        variants={staggerContainer}
        className="space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nu au fost găsite rapoarte
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Încercați să modificați criteriile de căutare sau să creați un raport nou.
            </p>
          </div>
        ) : (
          filteredReports.map((report, index) => {
            const ReportIcon = getReportTypeIcon(report.reportType)
            return (
              <motion.div
                key={report.id}
                variants={cardVariants}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <ReportIcon className="w-5 h-5 text-purple-600" />
                  </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {report.title}
              </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(report.status)}`}>
                          {report.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{report.patientName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{report.date.toLocaleDateString('ro-RO')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Stethoscope className="w-3 h-3" />
                          <span>{report.doctorName}</span>
                        </div>
                        </div>
                        
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Diagnostic:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {report.content.diagnosis}
                        </p>
                      </div>

                      {/* AI Analysis */}
                      {report.aiAnalysis && (
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Analiză AI
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getRiskLevelColor(report.aiAnalysis.riskLevel)}`}>
                              Risc {report.aiAnalysis.riskLevel}
                          </span>
                            <span className="text-xs text-gray-500">
                              {report.aiAnalysis.confidence}% încredere
                            </span>
                          </div>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {report.aiAnalysis.insights.slice(0, 2).map((insight, idx) => (
                              <li key={idx} className="flex items-start space-x-1">
                                <span className="text-purple-600">•</span>
                                <span>{insight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Attachments */}
                      {report.attachments.length > 0 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <FileText className="w-3 h-3" />
                          <span>{report.attachments.length} atașamente</span>
                        </div>
                      )}
                      </div>
                    </div>
                    
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                      <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Vezi raportul"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                    <button
                      onClick={() => handleExportReport(report, 'pdf')}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Exportă PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                        <button
                      onClick={() => handleShareReport(report)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Partajează"
                    >
                      <Share2 className="w-4 h-4" />
                        </button>
                      
                    <div className="relative">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Mai multe opțiuni"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    </div>
                  </div>
                </motion.div>
            )
          })
          )}
      </motion.div>

      {/* Report Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedReport.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedReport.patientName} • {selectedReport.date.toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleExportReport(selectedReport, 'pdf')}
                      className="flex items-center space-x-1 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportă</span>
                    </button>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Report Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Simptome</h4>
                    <ul className="space-y-1">
                      {selectedReport.content.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recomandări</h4>
                    <ul className="space-y-1">
                      {selectedReport.content.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Star className="w-3 h-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Diagnostic</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedReport.content.diagnosis}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Plan de tratament</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedReport.content.treatment}
                  </p>
                </div>

                {selectedReport.content.medications && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Medicație</h4>
                    <ul className="space-y-1">
                      {selectedReport.content.medications.map((med, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span>{med}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReport.aiAnalysis && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <span>Analiză AI detaliată</span>
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Insights</h5>
                        <ul className="space-y-1">
                          {selectedReport.aiAnalysis.insights.map((insight, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Recomandări AI</h5>
                        <ul className="space-y-1">
                          {selectedReport.aiAnalysis.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                              → {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}