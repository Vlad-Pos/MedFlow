/**
 * Patient Search Component
 * 
 * Advanced patient search and selection component for appointment forms.
 * Integrates with the unified patient management system.
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Plus,
  Loader2,
  X
} from 'lucide-react'
import { patientService } from '../services/patientService'
import { Patient, PatientSearchQuery } from '../types/patient'
import { extractGenderFromCNP, extractBirthDateFromCNP } from '../utils/cnpValidation'

interface PatientSearchProps {
  onPatientSelect: (patient: Patient | null) => void
  selectedPatient: Patient | null
  placeholder?: string
  className?: string
  disabled?: boolean
}

interface SearchResultItemProps {
  patient: Patient
  isSelected: boolean
  onSelect: () => void
  onHighlight: () => void
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ 
  patient, 
  isSelected, 
  onSelect, 
  onHighlight 
}) => {
  const age = useMemo(() => {
    if (!patient.personalInfo.dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(patient.personalInfo.dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }, [patient.personalInfo.dateOfBirth])

  const genderIcon = useMemo(() => {
    switch (patient.personalInfo.gender) {
      case 'male': return '♂'
      case 'female': return '♀'
      default: return '⚥'
    }
  }, [patient.personalInfo.gender])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        p-4 border rounded-lg cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-medflow-primary bg-medflow-primary/5' 
          : 'border-gray-200 hover:border-medflow-primary/50 hover:bg-gray-50'
        }
      `}
      onClick={onSelect}
      onMouseEnter={onHighlight}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{genderIcon}</span>
            <h3 className="font-semibold text-gray-900">
              {patient.personalInfo.fullName}
            </h3>
            {age && (
              <span className="text-sm text-gray-500">
                ({age} ani)
              </span>
            )}
            {patient.personalInfo.cnp && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                CNP: {patient.personalInfo.cnp}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {patient.contactInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{patient.contactInfo.phone}</span>
              </div>
            )}
            {patient.contactInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{patient.contactInfo.email}</span>
              </div>
            )}
          </div>
          
          {patient.medicalInfo.allergies.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-sm text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span>Alergii: {patient.medicalInfo.allergies.map(a => a.allergen).join(', ')}</span>
            </div>
          )}
          
          {patient.medicalInfo.chronicConditions.length > 0 && (
            <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>Condiții cronice: {patient.medicalInfo.chronicConditions.map(c => c.name).join(', ')}</span>
            </div>
          )}
        </div>
        
        {isSelected && (
          <CheckCircle className="w-5 h-5 text-medflow-primary" />
        )}
      </div>
    </motion.div>
  )
}

export default function PatientSearch({ 
  onPatientSelect, 
  selectedPatient, 
  placeholder = "Căutați pacient după nume, CNP, email sau telefon...",
  className = "",
  disabled = false
}: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      setSearchError(null)

      try {
        const searchQuery: PatientSearchQuery = {
          query: query.trim(),
          filters: {
            isActive: true
          },
          limit: 10
        }

        const result = await patientService.searchPatients(searchQuery)
        setSearchResults(result.patients)
        setShowResults(true)
        setHighlightedIndex(-1)
      } catch (error) {
        console.error('Error searching patients:', error)
        setSearchError('Eroare la căutarea pacienților')
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300),
    []
  )

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedSearch(query)
  }

  // Handle patient selection
  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient)
    setSearchQuery(patient.personalInfo.fullName)
    setShowResults(false)
    setHighlightedIndex(-1)
  }

  // Handle clear selection
  const handleClearSelection = () => {
    onPatientSelect(null)
    setSearchQuery('')
    setShowResults(false)
    setHighlightedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : searchResults.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
          handlePatientSelect(searchResults[highlightedIndex])
        }
        break
      case 'Escape':
        setShowResults(false)
        setHighlightedIndex(-1)
        break
    }
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true)
    }
  }

  // Handle input blur (with delay to allow clicks)
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false)
      setHighlightedIndex(-1)
    }, 200)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-medflow-primary focus:border-medflow-primary
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${selectedPatient ? 'bg-green-50 border-green-300' : ''}
          `}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : selectedPatient ? (
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Selected Patient Display */}
      {selectedPatient && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                Pacient selectat: {selectedPatient.personalInfo.fullName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Search Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
          >
            {searchError ? (
              <div className="p-4 text-center text-red-600">
                <AlertCircle className="w-5 h-5 mx-auto mb-2" />
                <p>{searchError}</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <User className="w-5 h-5 mx-auto mb-2" />
                <p>Nu s-au găsit pacienți</p>
                <p className="text-sm">Încercați o altă căutare</p>
              </div>
            ) : (
              <div className="p-2">
                {searchResults.map((patient, index) => (
                  <SearchResultItem
                    key={patient.id}
                    patient={patient}
                    isSelected={index === highlightedIndex}
                    onSelect={() => handlePatientSelect(patient)}
                    onHighlight={() => setHighlightedIndex(index)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}