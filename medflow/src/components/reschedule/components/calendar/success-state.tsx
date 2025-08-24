import { motion } from "framer-motion"
import { CheckCircle, Calendar, Clock, MapPin, Stethoscope, User } from "lucide-react"
import { formatDate } from "../../utils/calendar"

interface SuccessStateProps {
  selectedCalendarDate: Date | null
  selectedSlot: string
  timeSlots: any[]
  onScheduleAnother: () => void
  patientName?: string
  doctorName?: string
  doctorSpecialty?: string
  location?: string
}

export default function SuccessState({ 
  selectedCalendarDate, 
  selectedSlot, 
  timeSlots, 
  onScheduleAnother,
  patientName,
  doctorName,
  doctorSpecialty,
  location
}: SuccessStateProps) {
  const selectedTimeSlot = timeSlots.find((slot) => slot.id === selectedSlot)

  return (
    <div className="text-center px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
      >
        <CheckCircle className="w-8 h-8 text-green-600" />
      </motion.div>
      
      <h3 className="text-lg font-semibold text-[var(--medflow-text-primary)] dark:text-white mb-3">
        Reprogramare confirmată!
      </h3>
      
      <p className="text-sm text-[var(--medflow-text-secondary)] dark:text-gray-300 mb-6">
        Programarea dvs. a fost reprogramată. Verificați detaliile de mai jos.
      </p>

      {/* New Appointment Details */}
      <div className="bg-[var(--medflow-surface-elevated)] dark:bg-[var(--medflow-surface-dark)] rounded-lg p-4 text-left text-sm space-y-3 mb-6">
        <h4 className="font-semibold text-[var(--medflow-text-primary)] dark:text-white mb-3 text-center">
          Detalii programare reprogramată
        </h4>
        
        {patientName && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[var(--medflow-brand-1)]" />
            <span className="text-[var(--medflow-text-primary)] dark:text-white">
              <strong>Pacient:</strong> {patientName}
            </span>
          </div>
        )}
        
        {doctorName && (
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-[var(--medflow-brand-1)]" />
            <span className="text-[var(--medflow-text-primary)] dark:text-white">
              <strong>Medic:</strong> {doctorName}
              {doctorSpecialty && ` - ${doctorSpecialty}`}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-[var(--medflow-brand-1)]" />
          <span className="text-[var(--medflow-text-primary)] dark:text-white">
            <strong>Data:</strong> {selectedCalendarDate && formatDate(selectedCalendarDate)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[var(--medflow-brand-1)]" />
          <span className="text-[var(--medflow-text-primary)] dark:text-white">
            <strong>Ora:</strong> {selectedTimeSlot?.time}
          </span>
        </div>
        
        {location && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[var(--medflow-brand-1)]" />
            <span className="text-[var(--medflow-text-primary)] dark:text-white">
              <strong>Locația:</strong> {location}
            </span>
          </div>
        )}
      </div>

      {/* Rescheduling Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 text-sm">
          Rezumat reprogramare:
        </h4>
        <div className="text-xs text-green-700 dark:text-green-300 space-y-1">
          <p>✓ Programarea a fost reprogramată cu succes</p>
          <p>✓ Noua dată și ora au fost confirmate</p>
          <p>✓ Sistemul a fost actualizat automat</p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-sm">
          Ce urmează:
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 text-left">
          <li>• Veți primi un email de confirmare cu noua dată și ora</li>
          <li>• Reminder-urile vor fi actualizate automat</li>
          <li>• Programarea va fi vizibilă în contul dvs. personal</li>
          <li>• Contactați cabinetul pentru întrebări sau modificări suplimentare</li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onScheduleAnother}
        className="px-4 py-2 bg-[var(--medflow-brand-1)] text-white rounded-lg hover:bg-[var(--medflow-brand-2)] transition-colors"
      >
        Reprogramează altă programare
      </button>
    </div>
  )
}
