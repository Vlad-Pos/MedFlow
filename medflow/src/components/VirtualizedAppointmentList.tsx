import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAnimationPerformance } from '../hooks/useAnimationPerformance'
import { Trash2, Edit, Clock, User, AlertTriangle } from 'lucide-react'

interface Appointment {
  id: string
  patientName: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: 'scheduled' | 'completed' | 'no_show'
  userId: string // User ID for the new ADMIN/USER role system
}

interface VirtualizedAppointmentListProps {
  appointments: Appointment[]
  onAppointmentClick?: (appointment: Appointment) => void
  onDeleteAppointment?: (id: string) => void
  onEditAppointment?: (id: string) => void
  itemHeight?: number
  containerHeight?: number
  className?: string
}

interface VirtualizedItem {
  appointment: Appointment
  index: number
  top: number
  visible: boolean
}

/**
 * Enterprise-grade virtualized appointment list
 * 
 * Features:
 * - Virtual scrolling for large datasets
 * - Performance-optimized animations
 * - Memory-efficient rendering
 * - Accessibility support
 * - Touch-friendly interactions
 */
const VirtualizedAppointmentList = memo(({
  appointments,
  onAppointmentClick,
  onDeleteAppointment,
  onEditAppointment,
  itemHeight = 80,
  containerHeight = 600,
  className = ''
}: VirtualizedAppointmentListProps) => {
  const { shouldAnimate, getOptimizedTransition } = useAnimationPerformance()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  
  // Calculate visible items based on scroll position
  const visibleItems = useMemo((): VirtualizedItem[] => {
    if (!appointments.length) return []
    
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2,
      appointments.length
    )
    
    return appointments.slice(startIndex, endIndex).map((appointment, relativeIndex) => {
      const index = startIndex + relativeIndex
      return {
        appointment,
        index,
        top: index * itemHeight,
        visible: true
      }
    })
  }, [appointments, scrollTop, itemHeight, containerHeight])
  
  // Memoized status utilities
  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }, [])
  
  const getStatusText = useCallback((status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'Programat'
      case 'completed':
        return 'Completat'
      case 'no_show':
        return 'Nu s-a prezentat'
      default:
        return 'Necunoscut'
    }
  }, [])
  
  // Handle scroll events with throttling
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement
    setScrollTop(target.scrollTop)
  }, [])
  
  // Resize observer for container dimensions
  useEffect(() => {
    if (!containerRef.current) return
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setContainerDimensions({ width, height })
      }
    })
    
    resizeObserver.observe(containerRef.current)
    
    return () => resizeObserver.disconnect()
  }, [])
  
  // Calculate total height for proper scrolling
  const totalHeight = appointments.length * itemHeight
  
  // Performance monitoring
  const renderTimeRef = useRef<number>(0)
  
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      renderTimeRef.current = endTime - startTime
      
      if (renderTimeRef.current > 16) {
        console.warn(`VirtualizedList render took ${renderTimeRef.current.toFixed(2)}ms`)
      }
    }
  })
  
  // If animations are disabled, render static list
  if (!shouldAnimate('virtualized-list')) {
    return (
      <div 
        ref={containerRef}
        className={`overflow-auto ${className}`}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map(({ appointment, top }) => (
            <div
              key={appointment.id}
              className="absolute left-0 right-0 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              style={{ top, height: itemHeight }}
            >
              <AppointmentItem
                appointment={appointment}
                onAppointmentClick={onAppointmentClick}
                onDeleteAppointment={onDeleteAppointment}
                onEditAppointment={onEditAppointment}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                static={true}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  // Render with optimized animations
  return (
    <div 
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <AnimatePresence>
          {visibleItems.map(({ appointment, top, index }) => (
            <motion.div
              key={appointment.id}
              className="absolute left-0 right-0"
              style={{ top, height: itemHeight }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={getOptimizedTransition({
                delay: index * 0.05,
                duration: 0.2
              })}
            >
              <AppointmentItem
                appointment={appointment}
                onAppointmentClick={onAppointmentClick}
                onDeleteAppointment={onDeleteAppointment}
                onEditAppointment={onEditAppointment}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                static={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
})

VirtualizedAppointmentList.displayName = 'VirtualizedAppointmentList'

// Individual appointment item component
interface AppointmentItemProps {
  appointment: Appointment
  onAppointmentClick?: (appointment: Appointment) => void
  onDeleteAppointment?: (id: string) => void
  onEditAppointment?: (id: string) => void
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
  static: boolean
}

const AppointmentItem = memo(({
  appointment,
  onAppointmentClick,
  onDeleteAppointment,
  onEditAppointment,
  getStatusColor,
  getStatusText,
  static: isStatic
}: AppointmentItemProps) => {
  const { shouldAnimate } = useAnimationPerformance()
  const canAnimate = shouldAnimate('appointment-item') && !isStatic
  
  const handleClick = useCallback(() => {
    onAppointmentClick?.(appointment)
  }, [appointment, onAppointmentClick])
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteAppointment?.(appointment.id)
  }, [appointment.id, onDeleteAppointment])
  
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onEditAppointment?.(appointment.id)
  }, [appointment.id, onEditAppointment])
  
  const baseClasses = "p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
  
  if (!canAnimate) {
    return (
      <div className={baseClasses} onClick={handleClick}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="font-medium text-gray-900 dark:text-white truncate">
                {appointment.patientName}
              </span>
            </div>
            <div className="flex items-center space-x-3 mt-1">
              <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {appointment.dateTime.toLocaleString('ro-RO')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {appointment.symptoms}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
            <div className="flex space-x-1">
              {onEditAppointment && (
                <button
                  onClick={handleEdit}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="Editează programarea"
                >
                  <Edit className="w-3 h-3" />
                </button>
              )}
              {onDeleteAppointment && (
                <button
                  onClick={handleDelete}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Șterge programarea"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Render with animations
  return (
    <motion.div
      className={baseClasses}
      onClick={handleClick}
      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.8)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {appointment.patientName}
            </span>
          </motion.div>
          <motion.div 
            className="flex items-center space-x-3 mt-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {appointment.dateTime.toLocaleString('ro-RO')}
            </span>
          </motion.div>
          <motion.p 
            className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {appointment.symptoms}
          </motion.p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <motion.span 
            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
          >
            {getStatusText(appointment.status)}
          </motion.span>
          <div className="flex space-x-1">
            {onEditAppointment && (
              <motion.button
                onClick={handleEdit}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="Editează programarea"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit className="w-3 h-3" />
              </motion.button>
            )}
            {onDeleteAppointment && (
              <motion.button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Șterge programarea"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="w-3 h-3" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
})

AppointmentItem.displayName = 'AppointmentItem'

export default VirtualizedAppointmentList
