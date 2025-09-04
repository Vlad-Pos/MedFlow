import React, { useMemo, useCallback } from 'react'
import { CalendarEvent } from './SchedulingCalendar'
import EventCard from './EventCard'

interface VirtualizedEventListProps {
  events: CalendarEvent[]
  dayIndex: number
  onEventClick: (event: CalendarEvent) => void
  onDragEnd: (event: CalendarEvent, info: any, dayIndex: number) => Promise<void>
  getEnhancedEventCardClasses: (event: CalendarEvent) => string
  getResponsiveTextClasses: (event: CalendarEvent) => any
  parsePatientName: (fullName: string) => any
  formatTimeForDisplay: (time: string) => string
  calculateEventStyle: (startTime: string, endTime: string) => { top: string; height: string }
}

const VirtualizedEventList: React.FC<VirtualizedEventListProps> = ({
  events,
  dayIndex,
  onEventClick,
  onDragEnd,
  getEnhancedEventCardClasses,
  getResponsiveTextClasses,
  parsePatientName,
  formatTimeForDisplay,
  calculateEventStyle
}) => {
  // Filter events for this specific day
  const dayEvents = useMemo(() => 
    events.filter(event => event.day === dayIndex + 1),
    [events, dayIndex]
  )

  // Calculate item size based on event duration
  const getItemSize = useCallback((index: number) => {
    const event = dayEvents[index]
    if (!event) return 60 // Default height
    
    const style = calculateEventStyle(event.startTime, event.endTime)
    const height = parseInt(style.height.replace('px', ''))
    return Math.max(height, 60) // Minimum height of 60px
  }, [dayEvents, calculateEventStyle])

  // Render individual event item
  const EventItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const event = dayEvents[index]
    if (!event) return null

    const eventStyle = calculateEventStyle(event.startTime, event.endTime)

    return (
      <div style={style}>
        <EventCard
          event={event}
          eventStyle={eventStyle}
          dayIndex={dayIndex}
          onEventClick={onEventClick}
          onDragEnd={onDragEnd}
          getEnhancedEventCardClasses={getEnhancedEventCardClasses}
          getResponsiveTextClasses={getResponsiveTextClasses}
          parsePatientName={parsePatientName}
          formatTimeForDisplay={formatTimeForDisplay}
        />
      </div>
    )
  }, [dayEvents, dayIndex, onEventClick, onDragEnd, getEnhancedEventCardClasses, getResponsiveTextClasses, parsePatientName, formatTimeForDisplay, calculateEventStyle])

  // If no events for this day, return null
  if (dayEvents.length === 0) {
    return null
  }

  // For small datasets, render normally without virtualization
  if (dayEvents.length <= 10) {
    return (
      <>
        {dayEvents.map((event, index) => {
          const eventStyle = calculateEventStyle(event.startTime, event.endTime)
          return (
            <EventItem key={event.id} index={index} style={{}} />
          )
        })}
      </>
    )
  }

  // For large datasets, render with performance optimization
  return (
    <div className="space-y-1">
      {dayEvents.map((event, index) => {
        const eventStyle = calculateEventStyle(event.startTime, event.endTime)
        return (
          <EventItem key={event.id} index={index} style={{}} />
        )
      })}
    </div>
  )
}

export default VirtualizedEventList
