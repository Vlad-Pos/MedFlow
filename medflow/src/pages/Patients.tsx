import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Users, Search, Calendar, Mail, Phone, MapPin, FileText, Edit3, Trash2 } from 'lucide-react'
import PatientSearch from '../components/PatientSearch'
import LoadingSpinner from '../components/LoadingSpinner'
import { isDemoMode } from '../utils/demo'

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
  createdAt?: Date
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    // Load demo patients or real data
    if (isDemoMode()) {
      const demoPatients: Patient[] = [
        {
          id: '1',
          name: 'Ana Popescu',
          email: 'ana.popescu@email.com',
          phone: '0740123456',
          dateOfBirth: '1985-03-15',
          lastVisit: new Date('2024-01-15'),
          totalAppointments: 8,
          notes: 'Controale regulate pentru hipertensiune',
          address: 'București, Sector 1',
          createdAt: new Date('2023-06-15')
        },
        {
          id: '2',
          name: 'Ion Marinescu',
          email: 'ion.marinescu@email.com',
          phone: '0741234567',
          dateOfBirth: '1978-07-22',
          lastVisit: new Date('2024-01-12'),
          totalAppointments: 15,
          notes: 'Diabet zaharat tip 2, necesită monitorizare glicemie',
          address: 'Cluj-Napoca, str. Memorandumului 15',
          createdAt: new Date('2023-04-10')
        },
        {
          id: '3',
          name: 'Maria Ionescu',
          phone: '0742345678',
          dateOfBirth: '1990-11-10',
          lastVisit: new Date('2024-01-08'),
          totalAppointments: 3,
          address: 'Timișoara, bd. Liviu Rebreanu 45',
          createdAt: new Date('2023-12-01')
        },
        {
          id: '4',
          name: 'Gheorghe Dumitrescu',
          email: 'gheorghe.d@email.com',
          phone: '0743456789',
          dateOfBirth: '1965-05-30',
          lastVisit: new Date('2024-01-05'),
          totalAppointments: 22,
          notes: 'Pacient cronic, controale lunare obligatorii',
          address: 'Iași, str. Păcurari 12',
          createdAt: new Date('2022-08-20')
        },
        {
          id: '5',
          name: 'Elena Vasilescu',
          email: 'elena.v@email.com',
          phone: '0744567890',
          dateOfBirth: '1995-12-05',
          lastVisit: new Date('2024-01-20'),
          totalAppointments: 2,
          notes: 'Pacient nou, consultații pentru migrene',
          address: 'Constanța, str. Mircea cel Bătrân 8',
          createdAt: new Date('2024-01-01')
        }
      ]
      
      setTimeout(() => {
        setPatients(demoPatients)
        setLoading(false)
      }, 800)
    } else {
      // TODO: Load from Firebase
      setLoading(false)
    }
  }, [])

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-medflow-text-secondary">
            Se încarcă informațiile pacienților...
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-medflow-text-primary flex items-center space-x-3">
            <Users className="w-8 h-8 text-medflow-accent" />
            <span>Pacienți</span>
          </h1>
          <p className="text-medflow-text-secondary mt-1">
            Gestionează informațiile și istoricul pacienților din cabinetul dumneavoastră
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex bg-medflow-surface/60 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-medflow-accent text-white'
                  : 'text-medflow-text-muted hover:text-medflow-text-primary'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-medflow-accent text-white'
                  : 'text-medflow-text-muted hover:text-medflow-text-primary'
              }`}
            >
              Listă
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center space-x-2 bg-medflow-accent hover:bg-medflow-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Adaugă pacient</span>
          </motion.button>
        </div>
      </div>

      {/* Demo indicator */}
      {isDemoMode() && (
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-300 text-sm">
                <strong>Mod demonstrație:</strong> Pacienții afișați sunt date simulate pentru prezentare. 
                Toate funcționalitățile sunt disponibile pentru testare în siguranță.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total pacienți', value: patients.length, icon: Users, color: 'text-medflow-accent' },
          { label: 'Pacienți activi', value: patients.filter(p => p.lastVisit && new Date(p.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: Calendar, color: 'text-green-400' },
          { label: 'Programări totale', value: patients.reduce((sum, p) => sum + p.totalAppointments, 0), icon: FileText, color: 'text-blue-400' },
          { label: 'Pacienți noi (luna)', value: patients.filter(p => p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: Plus, color: 'text-orange-400' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-medflow-surface/60 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-medflow-text-muted text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-medflow-text-primary">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-2xl">
        <PatientSearch 
          onPatientSelect={(patient) => {
            setSelectedPatient(patient)
            // Could navigate to patient detail view
          }}
          placeholder="Caută pacient după nume, email, telefon sau adresă..."
          className="w-full"
        />
      </div>

      {/* Patients List/Grid */}
      {viewMode === 'grid' ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-medflow-surface/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-medflow-surface/80 transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-medflow-accent/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-medflow-accent" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-medflow-text-primary truncate">{patient.name}</h3>
                    {patient.dateOfBirth && (
                      <p className="text-sm text-medflow-text-muted">
                        {calculateAge(patient.dateOfBirth)} ani
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Edit3 className="w-4 h-4 text-medflow-text-muted" />
                  </button>
                  <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {patient.email && (
                  <div className="flex items-center space-x-2 text-sm text-medflow-text-muted">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-center space-x-2 text-sm text-medflow-text-muted">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center space-x-2 text-sm text-medflow-text-muted">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{patient.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-medflow-text-muted">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>Ultima vizită: {patient.lastVisit ? formatLastVisit(patient.lastVisit) : 'Niciodată'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-sm text-medflow-text-muted">
                  {patient.totalAppointments} programări
                </span>
                {patient.notes && (
                  <span className="text-xs bg-medflow-accent/20 text-medflow-accent px-2 py-1 rounded">
                    Cu note
                  </span>
                )}
              </div>

              {patient.notes && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-medflow-text-muted line-clamp-2">
                    <strong>Note:</strong> {patient.notes}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-medflow-surface/60 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-medflow-surface/80 border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-medium text-medflow-text-primary">Pacient</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-medflow-text-primary">Contact</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-medflow-text-primary">Ultima vizită</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-medflow-text-primary">Programări</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-medflow-text-primary">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <motion.tr
                    key={patient.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-medflow-accent/20 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-medflow-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-medflow-text-primary">{patient.name}</p>
                          {patient.dateOfBirth && (
                            <p className="text-sm text-medflow-text-muted">
                              {calculateAge(patient.dateOfBirth)} ani
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {patient.email && (
                          <div className="flex items-center space-x-2 text-sm text-medflow-text-muted">
                            <Mail className="w-3 h-3" />
                            <span>{patient.email}</span>
                          </div>
                        )}
                        {patient.phone && (
                          <div className="flex items-center space-x-2 text-sm text-medflow-text-muted">
                            <Phone className="w-3 h-3" />
                            <span>{patient.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-medflow-text-muted">
                      {patient.lastVisit ? formatLastVisit(patient.lastVisit) : 'Niciodată'}
                    </td>
                    <td className="py-4 px-6 text-sm text-medflow-text-primary font-medium">
                      {patient.totalAppointments}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4 text-medflow-text-muted" />
                        </button>
                        <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {patients.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-20 h-20 text-medflow-text-muted mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-medium text-medflow-text-secondary mb-3">
            Niciun pacient înregistrat
          </h3>
          <p className="text-medflow-text-muted mb-8 max-w-md mx-auto">
            Începeți prin a adăuga primul pacient folosind butonul de mai sus. 
            Veți putea gestiona toate informațiile importante într-un singur loc.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center space-x-2 bg-medflow-accent hover:bg-medflow-accent-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Adaugă primul pacient</span>
          </motion.button>
        </div>
      )}
    </motion.section>
  )
}
