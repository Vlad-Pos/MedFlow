/**
 * 🏥 MedFlow - Mini Calendar Component for Consultation Hub
 * 
 * This component extracts ONLY the mini calendar functionality from the existing
 * SchedulingCalendar component, ensuring NO impact on the original /calendar page.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isSameDay } from 'date-fns'
import { ro } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'

// Types
interface CalendarEvent {
  id: number
  title: string
  startTime: string
  endTime: string
  color: string
  day: number
  description: string
  location: string
  attendees: string[]
  organizer: string
}

interface MiniCalendarProps {
  currentDate: Date
  selectedDate: Date
  events: CalendarEvent[]
  onDateSelect: (date: Date) => void
  onNewAppointment: () => void
  compact?: boolean
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  selectedDate,
  events,
  onDateSelect,
  onNewAppointment,
  compact = false
}) => {
  // State for mini calendar (copied from existing SchedulingCalendar)
  const [currentMonth, setCurrentMonth] = useState('')
  const [currentDateObj, setCurrentDateObj] = useState(currentDate)
  
  // Romanian week days (copied from existing SchedulingCalendar)
  const weekDays = ["L", "M", "M", "J", "V", "S", "D"]
  
  // Helper functions (copied from existing SchedulingCalendar)
  const capitalizeMonth = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  }

  const formatDateWithCapitalization = (date: Date, formatString: string): string => {
    try {
      const formatted = format(date, formatString, { locale: ro })
      return capitalizeMonth(formatted)
    } catch (error) {
      const formatted = format(date, formatString)
      return capitalizeMonth(formatted)
    }
  }

  // Navigation functions (copied from existing SchedulingCalendar)
  const goToPreviousMonth = useCallback(() => {
    const newDate = new Date(currentDateObj)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDateObj(newDate)
    setCurrentMonth(formatDateWithCapitalization(newDate, 'MMMM yyyy'))
  }, [currentDateObj])

  const goToNextMonth = useCallback(() => {
    const newDate = new Date(currentDateObj)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDateObj(newDate)
    setCurrentMonth(formatDateWithCapitalization(newDate, 'MMMM yyyy'))
  }, [currentDateObj])

  // Date selection handler (copied from existing SchedulingCalendar)
  const setCurrentDateHandler = useCallback((date: Date) => {
    setCurrentDateObj(date)
    setCurrentMonth(formatDateWithCapitalization(date, 'MMMM yyyy'))
    onDateSelect(date)
  }, [onDateSelect])

  // Initialize month display
  useEffect(() => {
    setCurrentMonth(formatDateWithCapitalization(currentDateObj, 'MMMM yyyy'))
  }, [currentDateObj])

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(currentDateObj.getFullYear(), currentDateObj.getMonth(), event.day)
      return isSameDay(eventDate, date)
    })
  }, [events, currentDateObj])

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 ${compact ? 'h-auto' : 'h-full'}`}>
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <CalendarIcon className="w-5 h-5 mr-2 text-purple-400" />
        Mini Calendar
      </h2>
      
      {/* Mini Calendar - EXACT COPY from existing SchedulingCalendar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">{currentMonth}</h3>
          <div className="flex gap-1">
            <motion.button
              className="p-1 text-white/70 hover:text-white transition-colors"
              onClick={goToPreviousMonth}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <motion.button
              className="p-1 text-white/70 hover:text-white transition-colors"
              onClick={goToNextMonth}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
        
        {/* Week Day Headers - EXACT COPY from existing SchedulingCalendar */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center text-white/50 text-xs py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid - EXACT COPY from existing SchedulingCalendar */}
        <div className="grid grid-cols-7 gap-1" key={`mini-calendar-${currentDateObj.toDateString()}`}>
          {/* Generate proper calendar days for current month */}
          {(() => {
            const firstDay = startOfMonth(currentDateObj)
            const lastDay = endOfMonth(currentDateObj)
            const startDate = startOfWeek(firstDay, { weekStartsOn: 1 })
            const endDate = endOfWeek(lastDay, { weekStartsOn: 1 })
            const days = eachDayOfInterval({ start: startDate, end: endDate })
            
            return days.map((date, i) => {
              const isCurrentMonth = date.getMonth() === currentDateObj.getMonth()
              const isTodayDate = isToday(date)
              const isSelectedDate = isSameDay(date, selectedDate)
              const dateEvents = getEventsForDate(date)
              
              return (
                <motion.div
                  key={`${date.toDateString()}-${i}`}
                  className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                    isSelectedDate ? "bg-[#7A48BF] text-white" : 
                    isTodayDate ? "bg-[#8A7A9F] text-white" :
                    isCurrentMonth ? "text-white hover:bg-white/20" : "text-white/50"
                  } transition-colors cursor-pointer relative`}
                  whileHover={{ 
                    scale: 1.05
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                  onClick={() => setCurrentDateHandler(date)}
                  title={`${format(date, 'EEEE, MMMM d, yyyy', { locale: ro })}${dateEvents.length > 0 ? ` - ${dateEvents.length} appointment(s)` : ''}`}
                >
                  {date.getDate()}
                  {/* Event indicator */}
                  {dateEvents.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full"></div>
                  )}
                </motion.div>
              )
            })
          })()}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 space-y-2">
        <button 
          onClick={onNewAppointment}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </button>
        <button className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center">
          <CalendarIcon className="w-4 h-4 mr-2" />
          View Full Calendar
        </button>
      </div>
    </div>
  )
}


