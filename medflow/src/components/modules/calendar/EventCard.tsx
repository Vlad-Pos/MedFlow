import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { CalendarEvent } from './SchedulingCalendar'

interface EventCardProps {
  event: CalendarEvent
  eventStyle: { top: string; height: string }
  dayIndex: number
  onEventClick: (event: CalendarEvent) => void
  onDragEnd: (event: CalendarEvent, info: any, dayIndex: number) => Promise<void>
  getEnhancedEventCardClasses: (event: CalendarEvent) => string
  getResponsiveTextClasses: (event: CalendarEvent) => any
  parsePatientName: (fullName: string) => any
  formatTimeForDisplay: (time: string) => string
}

const EventCard = memo<EventCardProps>(({
  event,
  eventStyle,
  dayIndex,
  onEventClick,
  onDragEnd,
  getEnhancedEventCardClasses,
  getResponsiveTextClasses,
  parsePatientName,
  formatTimeForDisplay
}) => {
  const textClasses = getResponsiveTextClasses(event)
  const nameData = parsePatientName(event.title)

  return (
    <motion.div
      // Drag & Drop functionality (PRESERVED)
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onDragEnd={async (_, info) => {
        await onDragEnd(event, info, dayIndex)
      }}
      
      // PRESERVED: All existing functionality
      whileHover={{ 
        scale: 1.02, 
        y: -4, 
        boxShadow: "0 16px 32px rgba(122, 72, 191, 0.25)",
        transition: { duration: 0.15, ease: "easeOut" } 
      }}
      whileTap={{ scale: 0.98 }}
      layout
      layoutId={`event-${event.id}`}
      className="w-full h-full"
      onClick={() => onEventClick(event)} // PRESERVED: Existing click handler
      
      // NEW: Enhanced accessibility for drag & drop
      aria-label={`Programare ${event.title}, poate fi mutată prin drag & drop`}
      title={`${event.title} - Click pentru detalii, drag pentru a muta`}
      
      // NEW: Visual feedback during drag
      whileDrag={{ 
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(122, 72, 191, 0.4)",
        zIndex: 1000
      }}
    >
      {/* NEW: Two-column responsive text layout */}
      <div className={textClasses.container}>
        {/* Left side: Patient names */}
        <div className={textClasses.nameContainer}>
          <div className={textClasses.textClass} title={event.title}>
            {nameData.firstName}
          </div>
          {!nameData.isSingleName && nameData.lastName && (
            <div className={textClasses.textClass} title={event.title}>
              {nameData.lastName}
            </div>
          )}
        </div>
        
        {/* Right side: Time */}
        <div className={textClasses.timeClass}>
          {`${formatTimeForDisplay(event.startTime)}-${formatTimeForDisplay(event.endTime)}`}
        </div>
      </div>
      
      {/* NEW: Visual indicator for drag & drop */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-2 h-2 bg-white/30 rounded-full"></div>
      </div>
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function for optimal memoization
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.startTime === nextProps.event.startTime &&
    prevProps.event.endTime === nextProps.event.endTime &&
    prevProps.event.title === nextProps.event.title &&
    prevProps.dayIndex === nextProps.dayIndex
  )
})

EventCard.displayName = 'EventCard'

export default EventCard

