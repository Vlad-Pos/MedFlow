/**
 * Appointment Templates Component for MedFlow
 * 
 * Features:
 * - Pre-defined templates for common medical procedures
 * - Quick appointment creation with standardized fields
 * - Customizable template management
 * - Duration and preparation guidelines
 * - Integration with appointment scheduling
 * - Medical specialty-specific templates
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Files, 
  Plus, 
  Clock, 
  FileText, 
  Edit, 
  Trash2,
  Star,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Zap,
  Copy
} from 'lucide-react'
import { staggerContainer, staggerItem, cardVariants } from '../utils/animations'
import { useAuth } from '../providers/AuthProvider'
import DesignWorkWrapper from '../../DesignWorkWrapper'

interface AppointmentTemplate {
  id: string
  name: string
  specialty: string
  duration: number // in minutes
  description: string
  defaultSymptoms: string
  preparationInstructions: string[]
  requiredDocuments: string[]
  followUpRequired: boolean
  followUpDays?: number
  estimatedCost?: string
  category: 'consultation' | 'procedure' | 'follow-up' | 'emergency'
  complexity: 'simple' | 'moderate' | 'complex'
  isActive: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

interface AppointmentTemplatesProps {
  onSelectTemplate: (template: AppointmentTemplate) => void
  onCreateFromTemplate?: (template: AppointmentTemplate, customData: any) => void
  showManagement?: boolean
}

const DEFAULT_TEMPLATES: AppointmentTemplate[] = [
  {
    id: 'general-consultation',
    name: 'Consultație generală',
    specialty: 'Medicină generală',
    duration: 30,
    description: 'Consultație medicală de rutină pentru evaluarea stării generale de sănătate',
    defaultSymptoms: 'Control de rutină, evaluare generală',
    preparationInstructions: [
      'Aduceți lista medicamentelor curente',
      'Pregătiți întrebările pe care doriți să le adresați',
      'Veniți cu 15 minute înainte de programare'
    ],
    requiredDocuments: ['Carte de identitate', 'Card de sănătate'],
    followUpRequired: false,
    category: 'consultation',
    complexity: 'simple',
    isActive: true,
    usageCount: 145,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'cardio-consultation',
    name: 'Consultație cardiologică',
    specialty: 'Cardiologie',
    duration: 45,
    description: 'Evaluare cardiovasculară specializată cu EKG și interpretare',
    defaultSymptoms: 'Dureri în piept, palpitații, dispnee de efort',
    preparationInstructions: [
      'Evitați cafeaua cu 2 ore înainte',
      'Aduceți rezultatele analizelor recente',
      'Purtați haine comode pentru EKG',
      'Lista completă a medicamentelor'
    ],
    requiredDocuments: ['Analize recente', 'EKG anterior (dacă există)', 'Scrisoare medicală'],
    followUpRequired: true,
    followUpDays: 14,
    estimatedCost: '200-300 RON',
    category: 'consultation',
    complexity: 'moderate',
    isActive: true,
    usageCount: 78,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: 'dermatology-consultation',
    name: 'Consultație dermatologică',
    specialty: 'Dermatologie',
    duration: 30,
    description: 'Examinare dermatologică cu dermatoscop digital',
    defaultSymptoms: 'Modificări ale pielii, mănâncimi, erupții cutanate',
    preparationInstructions: [
      'Nu aplicați creme sau machiaj pe zona afectată',
      'Fotografiați leziunile înainte de consultație',
      'Pregătiți istoricul familial pentru afecțiuni de piele'
    ],
    requiredDocuments: ['Fotografii ale leziunilor', 'Rezultate biopsie (dacă există)'],
    followUpRequired: false,
    category: 'consultation',
    complexity: 'simple',
    isActive: true,
    usageCount: 92,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: 'pediatric-consultation',
    name: 'Consultație pediatrică',
    specialty: 'Pediatrie',
    duration: 40,
    description: 'Consultație pentru copii cu evaluare dezvoltare și vaccinări',
    defaultSymptoms: 'Control de rutină, febră, probleme dezvoltare',
    preparationInstructions: [
      'Aduceți carnetul de vaccinări',
      'Pregătiți istoricul medical al copilului',
      'Notați întrebările despre dezvoltare',
      'Copilul să fie odihnit'
    ],
    requiredDocuments: ['Carnet de vaccinări', 'Rezultate analize (dacă există)', 'Carte de identitate părinte'],
    followUpRequired: true,
    followUpDays: 30,
    category: 'consultation',
    complexity: 'moderate',
    isActive: true,
    usageCount: 156,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'orthopedic-consultation',
    name: 'Consultație ortopedică',
    specialty: 'Ortopedie',
    duration: 35,
    description: 'Evaluare ortopedică cu examinare clinică și interpretare imagistică',
    defaultSymptoms: 'Dureri articulare, probleme mobilitate, traumatisme',
    preparationInstructions: [
      'Aduceți radiografiile și RMN-urile recente',
      'Purtați haine comode pentru examinare',
      'Descrieți istoricul traumatismelor'
    ],
    requiredDocuments: ['Radiografii', 'RMN/CT (dacă există)', 'Scrisoare medicală'],
    followUpRequired: true,
    followUpDays: 21,
    estimatedCost: '150-250 RON',
    category: 'consultation',
    complexity: 'moderate',
    isActive: true,
    usageCount: 67,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'emergency-consultation',
    name: 'Consultație de urgență',
    specialty: 'Urgențe',
    duration: 20,
    description: 'Evaluare rapidă pentru situații urgente non-vitale',
    defaultSymptoms: 'Simptome acute, dureri severe, stări febril acute',
    preparationInstructions: [
      'Veniți imediat dacă este urgența',
      'Aduceți lista medicamentelor',
      'Descrieți exact simptomele'
    ],
    requiredDocuments: ['Carte de identitate', 'Card de sănătate'],
    followUpRequired: true,
    followUpDays: 3,
    category: 'emergency',
    complexity: 'complex',
    isActive: true,
    usageCount: 234,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-16')
  }
]

const SPECIALTY_ICONS = {
  'Medicină generală': Stethoscope,
  'Cardiologie': Heart,
  'Dermatologie': Eye,
  'Pediatrie': Baby,
  'Ortopedie': Bone,
  'Urgențe': Zap,
  'Neurologie': Brain
}

export default function AppointmentTemplates({ 
  onSelectTemplate, 
  onCreateFromTemplate,
  showManagement = false 
}: AppointmentTemplatesProps) {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<AppointmentTemplate[]>(DEFAULT_TEMPLATES)
  const [filteredTemplates, setFilteredTemplates] = useState<AppointmentTemplate[]>(DEFAULT_TEMPLATES)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AppointmentTemplate | null>(null)

  // Filter templates based on search and filters
  useEffect(() => {
    let filtered = templates.filter(template => template.isActive)

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(template => template.specialty === selectedSpecialty)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchTerm, selectedSpecialty, selectedCategory])

  const specialties = Array.from(new Set(templates.map(t => t.specialty)))
  const categories = Array.from(new Set(templates.map(t => t.category)))

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-50 border-green-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'complex': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consultation': return FileText
      case 'procedure': return Stethoscope
      case 'follow-up': return Calendar
      case 'emergency': return AlertCircle
      default: return Files
    }
  }

  const handleUseTemplate = (template: AppointmentTemplate) => {
    // Increment usage count
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1, updatedAt: new Date() }
        : t
    ))
    
    onSelectTemplate(template)
  }

  const handleDuplicateTemplate = (template: AppointmentTemplate) => {
    const newTemplate: AppointmentTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (copie)`,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setTemplates(prev => [...prev, newTemplate])
  }

  return (
    <DesignWorkWrapper componentName="AppointmentTemplates">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
            <Files className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Template Programări
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Creați rapid programări cu template-uri predefinite
            </p>
          </div>
        </div>

        {showManagement && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Template nou</span>
          </button>
        )}
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Caută template-uri..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div className="flex space-x-3">
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">Toate specialitățile</option>
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>{specialty}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">Toate categoriile</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'consultation' ? 'Consultații' :
                 category === 'procedure' ? 'Proceduri' :
                 category === 'follow-up' ? 'Follow-up' :
                 category === 'emergency' ? 'Urgențe' : category}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Templates Grid */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredTemplates.map((template, index) => {
          const SpecialtyIcon = SPECIALTY_ICONS[template.specialty as keyof typeof SPECIALTY_ICONS] || Stethoscope
          const CategoryIcon = getCategoryIcon(template.category)
          
          return (
            <motion.div
              key={template.id}
              variants={cardVariants}
              whileHover="hover"
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <SpecialtyIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {template.specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <CategoryIcon className="w-4 h-4 text-gray-400" />
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(template.complexity)}`}>
                    {template.complexity}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {template.description}
              </p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {template.duration} minute
                  </span>
                </div>

                {template.followUpRequired && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Follow-up în {template.followUpDays} zile
                    </span>
                  </div>
                )}

                {template.estimatedCost && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Cost estimat: {template.estimatedCost}
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Folosit de {template.usageCount} ori
                  </span>
                </div>
              </div>

              {/* Preparation Instructions Preview */}
              {template.preparationInstructions.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Instrucțiuni de pregătire:
                  </h5>
                  <ul className="space-y-1">
                    {template.preparationInstructions.slice(0, 2).map((instruction, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{instruction}</span>
                      </li>
                    ))}
                    {template.preparationInstructions.length > 2 && (
                      <li className="text-sm text-gray-500 dark:text-gray-500">
                        +{template.preparationInstructions.length - 2} mai multe...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Folosește</span>
                </button>

                {showManagement && (
                  <>
                    <button
                      onClick={() => handleDuplicateTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Duplică template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Editează template"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <motion.div
          variants={staggerItem}
          className="text-center py-12"
        >
          <Files className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nu au fost găsite template-uri
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Încercați să modificați criteriile de căutare sau să creați un template nou.
          </p>
          {showManagement && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Creează primul template</span>
            </button>
          )}
        </motion.div>
      )}

      {/* Popular Templates */}
      <motion.div variants={staggerItem}>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Template-uri populare
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {templates
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 4)
            .map((template) => (
              <button
                key={template.id}
                onClick={() => handleUseTemplate(template)}
                className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {template.usageCount} utilizări
                  </p>
                </div>
              </button>
            ))}
        </div>
      </motion.div>
    </motion.div>
    </DesignWorkWrapper>
  )
}
