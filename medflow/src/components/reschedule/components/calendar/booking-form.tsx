import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Stethoscope, User, CheckCircle } from "lucide-react"
import { formatDate } from "../../utils/calendar"

interface FormData {
  name: string
  email: string
}

interface BookingFormProps {
  selectedDate: Date
  selectedSlot: string
  timeSlots: any[]
  onSubmit: (data: FormData) => void
  patientName?: string
  doctorName?: string
  doctorSpecialty?: string
  location?: string
}

export default function BookingForm({ 
  selectedDate, 
  selectedSlot, 
  timeSlots, 
  onSubmit,
  patientName,
  doctorName,
  doctorSpecialty,
  location
}: BookingFormProps) {
  const selectedTimeSlot = timeSlots.find(slot => slot.id === selectedSlot)

  const handleConfirm = () => {
    // Submit with existing patient data
    onSubmit({
      name: patientName || '',
      email: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <CheckCircle className="w-12 h-12 text-[var(--medflow-brand-1)] mx-auto mb-3" />
        <h4 className="text-lg font-semibold text-[var(--medflow-text-primary)] dark:text-white mb-2">
          Confirmați reprogramarea
        </h4>
        <p className="text-sm text-[var(--medflow-text-secondary)] dark:text-gray-300">
          Verificați detaliile programării reprogramate
        </p>
      </div>

      {/* Appointment Details */}
      <div className="bg-[var(--medflow-surface-elevated)] dark:bg-[var(--medflow-surface-dark)] rounded-lg p-4 space-y-3">
        <h5 className="font-medium text-[var(--medflow-text-primary)] dark:text-white mb-3 text-center">
          Detalii programare reprogramată
        </h5>
        
        {patientName && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[var(--medflow-brand-1)]" />
            <span className="text-sm text-[var(--medflow-text-primary)] dark:text-white">
              <strong>Pacient:</strong> {patientName}
            </span>
          </div>
        )}
        
        {doctorName && (
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-[var(--medflow-brand-1)]" />
            <span className="text-sm text-[var(--medflow-text-primary)] dark:text-white">
              <strong>Medic:</strong> {doctorName}
              {doctorSpecialty && ` - ${doctorSpecialty}`}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-[var(--medflow-brand-1)]" />
          <span className="text-sm text-[var(--medflow-text-primary)] dark:text-white">
            <strong>Data:</strong> {formatDate(selectedDate)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[var(--medflow-brand-1)]" />
          <span className="text-sm text-[var(--medflow-text-primary)] dark:text-white">
            <strong>Ora:</strong> {selectedTimeSlot?.time}
          </span>
        </div>
        
        {location && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[var(--medflow-brand-1)]" />
            <span className="text-sm text-[var(--medflow-text-primary)] dark:text-white">
              <strong>Locația:</strong> {location}
            </span>
          </div>
        )}
      </div>

      {/* Next Steps Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2 text-sm">
          Ce urmează după confirmare:
        </h5>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Veți primi un email de confirmare cu noua dată</li>
          <li>• Reminder-urile vor fi actualizate automat</li>
          <li>• Programarea va fi actualizată în sistem</li>
        </ul>
      </div>

      {/* Confirmation Button */}
      <motion.button
        type="button"
        onClick={handleConfirm}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full px-4 py-3 bg-[var(--medflow-brand-1)] text-white rounded-lg hover:bg-[var(--medflow-brand-2)] transition-colors font-medium"
      >
        Confirmă reprogramarea
      </motion.button>
    </div>
  )
}
