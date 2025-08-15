import { useRef, useState, ReactNode } from 'react'
import { motion, PanInfo } from 'framer-motion'
interface TouchGesturesProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onTap?: () => void
  onDoubleTap?: () => void
  onPinchIn?: () => void
  onPinchOut?: () => void
  className?: string
  disabled?: boolean
  threshold?: number
}

export default function TouchGestures({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onPinchIn,
  onPinchOut,
  className = '',
  disabled = false,
  threshold = 50
}: TouchGesturesProps) {
  const [tapCount, setTapCount] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const [initialDistance, setInitialDistance] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTap = () => {
    if (disabled) return

    const now = Date.now()
    const timeDiff = now - lastTapTime

    if (timeDiff < 300) {
      // Double tap
      setTapCount(0)
      setLastTapTime(0)
      onDoubleTap?.()
    } else {
      // Single tap
      setTapCount(1)
      setLastTapTime(now)
      onTap?.()
    }
  }

  const handlePanEnd = (_event: unknown, info: PanInfo) => {
    if (disabled) return

    const { offset } = info
    const { x, y } = offset

    // Determine swipe direction
    if (Math.abs(x) > Math.abs(y)) {
      if (x > threshold) {
        onSwipeRight?.()
      } else if (x < -threshold) {
        onSwipeLeft?.()
      }
    } else {
      if (y > threshold) {
        onSwipeDown?.()
      } else if (y < -threshold) {
        onSwipeUp?.()
      }
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || e.touches.length !== 2) return

    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )
    setInitialDistance(distance)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || e.touches.length !== 2 || !initialDistance) return

    const touch1 = e.touches[0]
    const touch2 = e.touches[1]
    const distance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )

    const scale = distance / initialDistance
    const threshold = 0.1

    if (scale < 1 - threshold) {
      onPinchIn?.()
      setInitialDistance(0)
    } else if (scale > 1 + threshold) {
      onPinchOut?.()
      setInitialDistance(0)
    }
  }

  const handleTouchEnd = () => {
    setInitialDistance(0)
  }

  return (
    <motion.div
        ref={containerRef}
        className={className}
        onTap={handleTap}
        onPanEnd={handlePanEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        whileTap={{ scale: 0.98 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
      >
        {children}
      </motion.div>
    )
}

// Swipeable card component
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
  threshold = 100
}: {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
  threshold?: number
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDrag = (_event: unknown, info: PanInfo) => {
    const { offset } = info
    if (offset.x > 0) {
      setDragDirection('right')
    } else if (offset.x < 0) {
      setDragDirection('left')
    }
  }

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    setIsDragging(false)
    setDragDirection(null)

    const { offset } = info
    if (Math.abs(offset.x) > threshold) {
      if (offset.x > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }
  }

  return (
    <motion.div
        className={`relative ${className}`}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.02 }}
        animate={{
          x: isDragging ? (dragDirection === 'left' ? -20 : 20) : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    )
}

// Pull to refresh component
export function PullToRefresh({
  children,
  onRefresh,
  className = '',
  threshold = 80
}: {
  children: ReactNode
  onRefresh: () => void
  className?: string
  threshold?: number
}) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const handlePan = (_event: unknown, info: PanInfo) => {
    const { offset } = info
    if (offset.y > 0) {
      setIsPulling(true)
      setPullDistance(Math.min(offset.y, threshold))
    }
  }

  const handlePanEnd = (_event: unknown, info: PanInfo) => {
    const { offset } = info
    if (offset.y > threshold) {
      onRefresh()
    }
    setIsPulling(false)
    setPullDistance(0)
  }

  return (
    <motion.div
        className={className}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        animate={{
          y: isPulling ? pullDistance * 0.3 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {isPulling && (
          <motion.div
            className="absolute top-0 left-0 right-0 flex justify-center items-center h-16 bg-blue-50 dark:bg-blue-900/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
        {children}
      </motion.div>
    )
}

// Pinch to zoom component
export function PinchToZoom({
  children,
  minScale = 0.5,
  maxScale = 3,
  className = ''
}: {
  children: ReactNode
  minScale?: number
  maxScale?: number
  className?: string
}) {
  const [scale, setScale] = useState(1)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.min(Math.max(prev * delta, minScale), maxScale))
  }

  return (
    <motion.div
        className={`overflow-hidden ${className}`}
        onWheel={handleWheel}
        style={{ scale }}
        drag
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
      >
        {children}
      </motion.div>
    )
}

