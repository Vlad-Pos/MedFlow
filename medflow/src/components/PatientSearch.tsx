import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Phone, Mail, Calendar, MapPin } from 'lucide-react'

interface Patient {
  id: string
  name: string
  email?: string
  phone?: string
  dateOfBirth?: string
  lastVisit?: Date
  totalAppointments: number
  notes?: string
  address?: string
}

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void
  placeholder?: string
  className?: string
}

export default function PatientSearch({ 
  onPatientSelect, 
  placeholder = "Caută pacient după nume, email sau telefon...",
  className = ""
}: PatientSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Demo patients data - replace with real API call
  const demoPatients: Patient[] = [
    {
      id: '1',
      name: 'Ana Popescu',
      email: 'ana.popescu@email.com',
      phone: '0740123456',
      dateOfBirth: '1985-03-15',
      lastVisit: new Date('2024-01-15'),
      totalAppointments: 8,
      notes: 'Controale regulate',
      address: 'București, Sector 1'
    },
    {
      id: '2',
      name: 'Ion Marinescu',
      email: 'ion.marinescu@email.com',
      phone: '0741234567',
      dateOfBirth: '1978-07-22',
      lastVisit: new Date('2024-01-12'),
      totalAppointments: 15,
      notes: 'Hipertensiune arterială',
      address: 'Cluj-Napoca'
    },
    {
      id: '3',
      name: 'Maria Ionescu',
      phone: '0742345678',
      dateOfBirth: '1990-11-10',
      lastVisit: new Date('2024-01-08'),
      totalAppointments: 3,
      address: 'Timișoara'
    },
    {
      id: '4',
      name: 'Gheorghe Dumitrescu',
      email: 'gheorghe.d@email.com',
      phone: '0743456789',
      dateOfBirth: '1965-05-30',
      lastVisit: new Date('2024-01-05'),
      totalAppointments: 22,
      notes: 'Diabet zaharat tip 2',
      address: 'Iași'
    }
  ]

  const filteredPatients = useMemo(() => {
    if (!query.trim() || query.length < 2) return []
    
    const searchTerm = query.toLowerCase().trim()
    return demoPatients.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchTerm) ||
      patient.phone?.includes(searchTerm) ||
      patient.address?.toLowerCase().includes(searchTerm)
    ).slice(0, 5)
  }, [query])

  const handleSearch = async (value: string) => {
    setQuery(value)
    if (value.length >= 2) {
      setIsLoading(true)
      setIsOpen(true)
      
      // Simulate API delay
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
    } else {
      setIsOpen(false)
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient)
    setQuery(patient.name)
    setIsOpen(false)
  }

  const formatLastVisit = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'ieri'
    if (diffDays < 7) return `acum ${diffDays} zile`
    if (diffDays < 30) return `acum ${Math.floor(diffDays / 7)} săptămâni`
    return date.toLocaleDateString('ro-RO')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medflow-text-muted w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="w-full bg-medflow-surface/80 border border-white/20 text-medflow-text-primary placeholder-medflow-text-muted rounded-lg pl-12 pr-4 py-3 focus:border-medflow-accent focus:ring-2 focus:ring-medflow-accent/30 transition-all"
          style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-medflow-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-medflow-surface-elevated/95 backdrop-blur-sm border border-white/25 rounded-lg shadow-xl max-h-80 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-medflow-text-muted">
                Se caută pacienți...
              </div>
            ) : filteredPatients.length > 0 ? (
              <>
                {filteredPatients.map((patient, index) => (
                  <motion.button
                    key={patient.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full text-left p-4 hover:bg-white/5 transition-colors border-b border-white/10 last:border-b-0 focus:outline-none focus:bg-white/5"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-medflow-accent/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-medflow-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-medflow-text-primary truncate" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>{patient.name}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 text-xs text-medflow-text-muted">
                          {patient.email && (
                            <span className="flex items-center space-x-1 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{patient.email}</span>
                            </span>
                          )}
                          {patient.phone && (
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span>{patient.phone}</span>
                            </span>
                          )}
                          {patient.address && (
                            <span className="flex items-center space-x-1 truncate">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{patient.address}</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>Ultima vizită: {formatLastVisit(patient.lastVisit!)}</span>
                          </span>
                        </div>
                        
                        {patient.notes && (
                          <div className="mt-2 p-2 bg-white/5 rounded text-xs text-medflow-text-muted truncate">
                            <strong>Note:</strong> {patient.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right text-xs text-medflow-text-muted">
                        <span className="font-medium">{patient.totalAppointments}</span>
                        <div>programări</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
                <div className="p-3 border-t border-white/10 text-center text-xs text-medflow-text-muted">
                  {filteredPatients.length === 5 ? 'Primele 5 rezultate' : `${filteredPatients.length} rezultate găsite`}
                </div>
              </>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-medflow-text-muted">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nu s-au găsit pacienți pentru "<span className="font-medium">{query}</span>"</p>
                <p className="text-xs mt-1">Încercați să căutați după nume, email sau telefon</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
