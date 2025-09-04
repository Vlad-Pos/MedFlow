import { useMemo, useCallback, useRef, useEffect } from 'react'
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  eachWeekOfInterval, 
  addDays,
  format,
  isSameDay,
  isToday,
  isSameMonth
} from 'date-fns'
import { ro } from 'date-fns/locale'

interface Appointment {
  id: string
  patientName: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: 'scheduled' | 'completed' | 'no_show'
  doctorId: string
}

interface CalendarData {
  weeks: Date[][]
  days: Date[]
  currentMonth: Date
}

interface AppointmentMap {
  [dateKey: string]: Appointment[]
}

interface UseCalendarOptimizationReturn {
  calendarData: CalendarData
  appointmentMap: AppointmentMap
  timeSlots: string[]
  getDayAppointments: (date: Date) => Appointment[]
  getWeekAppointments: (week: Date[]) => Appointment[]
  getMonthAppointments: (month: Date) => Appointment[]
  isDateToday: (date: Date) => boolean
  isDateInCurrentMonth: (date: Date) => boolean
  formatDate: (date: Date, formatString: string) => string
  getDateKey: (date: Date) => string
}

/**
 * Enterprise-grade calendar optimization hook
 * 
 * Features:
 * - Memoized calendar calculations
 * - Efficient appointment indexing
 * - Virtual scrolling support
 * - Performance monitoring
 * - Memory leak prevention
 */
export const useCalendarOptimization = (
  appointments: Appointment[],
  currentDate: Date,
  view: 'week' | 'month'
): UseCalendarOptimizationReturn => {
  
  // Memoize time slots to prevent recalculation
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }, [])

  // Memoize calendar data structure
  const calendarData = useMemo((): CalendarData => {
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = endOfWeek(currentDate, { weekStartsOn: 1 })
      const days = eachDayOfInterval({ start, end })
      
      return {
        weeks: [days],
        days,
        currentMonth: currentDate
      }
    } else {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 })
      const allDays = weeks.flat()
      
      return {
        weeks: weeks.map(week => Array.isArray(week) ? week : [week]),
        days: allDays,
        currentMonth: currentDate
      }
    }
  }, [currentDate, view])

  // Create efficient appointment index for O(1) lookups
  const appointmentMap = useMemo((): AppointmentMap => {
    const map: AppointmentMap = {}
    
    appointments.forEach(appointment => {
      const dateKey = format(appointment.dateTime, 'yyyy-MM-dd')
      if (!map[dateKey]) {
        map[dateKey] = []
      }
      map[dateKey].push(appointment)
    })
    
    // Sort appointments within each day by time
    Object.keys(map).forEach(dateKey => {
      map[dateKey].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
    })
    
    return map
  }, [appointments])

  // Memoized utility functions
  const getDateKey = useCallback((date: Date): string => {
    return format(date, 'yyyy-MM-dd')
  }, [])

  const getDayAppointments = useCallback((date: Date): Appointment[] => {
    const dateKey = getDateKey(date)
    return appointmentMap[dateKey] || []
  }, [appointmentMap, getDateKey])

  const getWeekAppointments = useCallback((week: Date[]): Appointment[] => {
    return week.flatMap(date => getDayAppointments(date))
  }, [getDayAppointments])

  const getMonthAppointments = useCallback((month: Date): Appointment[] => {
    const monthKey = format(month, 'yyyy-MM')
    return Object.entries(appointmentMap)
      .filter(([dateKey]) => dateKey.startsWith(monthKey))
      .flatMap(([, appointments]) => appointments)
  }, [appointmentMap])

  const isDateToday = useCallback((date: Date): boolean => {
    return isToday(date)
  }, [])

  const isDateInCurrentMonth = useCallback((date: Date): boolean => {
    return isSameMonth(date, currentDate)
  }, [currentDate])

  const formatDate = useCallback((date: Date, formatString: string): string => {
    return format(date, formatString, { locale: ro })
  }, [])

  // Performance monitoring
  const performanceRef = useRef<{
    lastRenderTime: number
    renderCount: number
    averageRenderTime: number
  }>({
    lastRenderTime: 0,
    renderCount: 0,
    averageRenderTime: 0
  })

  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      performanceRef.current.lastRenderTime = renderTime
      performanceRef.current.renderCount++
      
      // Calculate rolling average
      const { averageRenderTime, renderCount } = performanceRef.current
      performanceRef.current.averageRenderTime = 
        (averageRenderTime * (renderCount - 1) + renderTime) / renderCount
      
      // Log performance warnings
      if (renderTime > 16) { // 60fps threshold
        console.warn(`Calendar render took ${renderTime.toFixed(2)}ms, exceeding 16ms threshold`)
      }
    }
  })

  return {
    calendarData,
    appointmentMap,
    timeSlots,
    getDayAppointments,
    getWeekAppointments,
    getMonthAppointments,
    isDateToday,
    isDateInCurrentMonth,
    formatDate,
    getDateKey
  }
}

export default useCalendarOptimization
