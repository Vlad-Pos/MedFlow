"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import type { Experience, TimeSlot, FormData, ComponentState } from "./types/calendar"
import { formatDate, formatShortDate } from "./utils/calendar"
import { generateTimeSlots } from "./utils/time-slots"
import { getAvailableTimeSlots, getDefaultConstraints, type AvailableTimeSlot } from "../../services/appointmentService"
import CalendarGrid from "./components/calendar/calendar-grid"
import TimeSlotList from "./components/calendar/time-slot-list"
import BookingForm from "./components/calendar/booking-form"
import LoadingSpinner from "./components/calendar/loading-spinner"
import ErrorState from "./components/calendar/error-state"
import SuccessState from "./components/calendar/success-state"

interface VerticalMeetingCalendarProps {
  experience: Experience
  onReschedule?: (date: Date, time: string) => void
  excludeAppointmentId?: string
  appointmentDetails?: {
    patientName?: string
    doctorName?: string
    doctorSpecialty?: string
    location?: string
  }
}

export default function VerticalMeetingCalendar({ experience, onReschedule, excludeAppointmentId, appointmentDetails }: VerticalMeetingCalendarProps) {
  const [state, setState] = useState<ComponentState>("date-selection")
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCurrentMonth(new Date())
  }, [])

  useEffect(() => {
    if (selectedCalendarDate && timeSlots.length === 0) {
      setState("loading")
      setTimeout(() => {
        // Use real appointment service if available, otherwise fallback to v0 generation
        if (excludeAppointmentId) {
          loadAvailableTimeSlots(selectedCalendarDate)
        } else {
          setTimeSlots(generateTimeSlots())
          setState("time-selection")
        }
      }, 500)
    }
  }, [selectedCalendarDate, timeSlots.length, excludeAppointmentId])

  const loadAvailableTimeSlots = async (date: Date) => {
    setLoading(true)
    setState("loading")
    
    try {
      const constraints = getDefaultConstraints()
      const slots = await getAvailableTimeSlots(date, constraints, excludeAppointmentId)
      setAvailableSlots(slots)
      
      // Convert AvailableTimeSlot to TimeSlot format for the UI
      const uiTimeSlots: TimeSlot[] = slots
        .filter(slot => slot.available)
        .map((slot, index) => ({
          id: `${index}`,
          time: `${slot.start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${slot.end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
        }))
      
      setTimeSlots(uiTimeSlots)
      setState("time-selection")
    } catch (error) {
      console.error('Error loading available time slots:', error)
      // Fallback to v0 generation if real service fails
      setTimeSlots(generateTimeSlots())
      setState("time-selection")
    } finally {
      setLoading(false)
    }
  }

  const handleCalendarDateSelect = (date: Date) => {
    setTimeSlots([])
    setAvailableSlots([])
    setSelectedSlot("")
    setSelectedCalendarDate(date)
  }

  const handleMonthNavigate = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev)
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId)
    setState("form-input")
  }

  const handleFormSubmit = async (data: FormData) => {
    if (onReschedule && selectedCalendarDate && selectedSlot) {
      // Find the selected time slot
      const slot = timeSlots.find(s => s.id === selectedSlot)
      if (slot) {
        onReschedule(selectedCalendarDate, slot.time)
        return
      }
    }
    
    setState("loading")

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.2 ? resolve(true) : reject(new Error("Booking failed"))
        }, 2000)
      })
      setState("success")
    } catch (error) {
      setErrorMessage("Failed to schedule meeting. Please try again.")
      setState("error")
    }
  }

  const handleReset = () => {
    setSelectedCalendarDate(null)
    setSelectedSlot("")
    setErrorMessage("")
    setTimeSlots([])
    setAvailableSlots([])
    setState("date-selection")
    setCurrentMonth(new Date())
  }

  const handleBackToDateSelection = () => {
    setState("date-selection")
  }

  const handleBackToTimeSelection = () => {
    setState("time-selection")
  }

  return (
    <div className="w-full h-[380px] flex flex-col">
      <div className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--medflow-text-primary)] dark:text-white">{experience.title}</h3>
          {state !== "date-selection" && (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-[var(--medflow-text-tertiary)] dark:text-gray-500 hover:text-[var(--medflow-text-primary)] dark:hover:text-gray-200 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex gap-4">
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {state === "date-selection" && (
              <motion.div
                key="date-selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                <div className="flex-1 min-h-0">
                  <CalendarGrid
                    currentMonth={currentMonth}
                    selectedDate={selectedCalendarDate}
                    onDateSelect={handleCalendarDateSelect}
                    onMonthNavigate={handleMonthNavigate}
                  />
                </div>
                <div className="flex-shrink-0 pt-3">
                  <button
                    type="button"
                    disabled={!selectedCalendarDate}
                    onClick={() => selectedCalendarDate && handleCalendarDateSelect(selectedCalendarDate)}
                    className="w-full px-4 py-2 bg-[var(--medflow-brand-1)] text-white rounded-lg hover:bg-[var(--medflow-brand-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {onReschedule ? 'Selectează data' : 'Continue'}
                  </button>
                </div>
              </motion.div>
            )}

            {state === "time-selection" && (
              <motion.div
                key="time-selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center mb-3">
                  <button
                    type="button"
                    onClick={handleBackToDateSelection}
                    className="mr-2 p-1 hover:bg-[var(--medflow-surface-elevated)] dark:hover:bg-[var(--medflow-surface-dark)] rounded-md transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-[var(--medflow-text-secondary)] dark:text-gray-300">
                    {selectedCalendarDate && formatDate(selectedCalendarDate)}
                  </span>
                </div>
                <div className="flex-1 min-h-0">
                  <TimeSlotList
                    timeSlots={timeSlots}
                    selectedSlot={selectedSlot}
                    onSlotSelect={handleSlotSelect}
                  />
                </div>
                <div className="flex-shrink-0 pt-3">
                  <button
                    type="button"
                    disabled={!selectedSlot}
                    onClick={() => selectedSlot && handleSlotSelect(selectedSlot)}
                    className="w-full px-4 py-2 bg-[var(--medflow-brand-1)] text-white rounded-lg hover:bg-[var(--medflow-brand-2)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {state === "form-input" && (
              <motion.div
                key="form-input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                <div className="flex items-center mb-3">
                  <button
                    type="button"
                    onClick={handleBackToTimeSelection}
                    className="mr-2 p-1 hover:bg-[var(--medflow-surface-elevated)] dark:hover:bg-[var(--medflow-surface-dark)] rounded-md transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-[var(--medflow-text-secondary)] dark:text-gray-300">
                    {selectedCalendarDate && formatDate(selectedCalendarDate)} • {selectedSlot} • Confirmare
                  </span>
                </div>
                <div className="flex-1 min-h-0">
                  <BookingForm 
                    selectedDate={selectedCalendarDate!}
                    selectedSlot={selectedSlot}
                    timeSlots={timeSlots}
                    onSubmit={handleFormSubmit}
                    patientName={appointmentDetails?.patientName}
                    doctorName={appointmentDetails?.doctorName}
                    doctorSpecialty={appointmentDetails?.doctorSpecialty}
                    location={appointmentDetails?.location}
                  />
                </div>
              </motion.div>
            )}

            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <LoadingSpinner />
              </motion.div>
            )}

            {state === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <ErrorState message={errorMessage} onRetry={handleReset} />
              </motion.div>
            )}

            {state === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <SuccessState 
                  selectedCalendarDate={selectedCalendarDate}
                  selectedSlot={selectedSlot}
                  timeSlots={timeSlots}
                  onScheduleAnother={handleReset}
                  patientName={appointmentDetails?.patientName}
                  doctorName={appointmentDetails?.doctorName}
                  doctorSpecialty={appointmentDetails?.doctorSpecialty}
                  location={appointmentDetails?.location}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
