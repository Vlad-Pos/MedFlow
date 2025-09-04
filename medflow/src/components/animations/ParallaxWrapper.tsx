import React, { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxWrapperProps {
  children: React.ReactNode
  speed?: number
  direction?: 'up' | 'down'
  className?: string
  offset?: number
}

export default function ParallaxWrapper({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
  offset = 0
}: ParallaxWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [elementTop, setElementTop] = useState(0)
  const { scrollY } = useScroll()

  useEffect(() => {
    if (ref.current) {
      setElementTop(ref.current.offsetTop)
    }
  }, [])

  const y = useTransform(
    scrollY,
    [elementTop - window.innerHeight, elementTop + window.innerHeight],
    [direction === 'up' ? offset : -offset, direction === 'up' ? -offset : offset]
  )

  const opacity = useTransform(
    scrollY,
    [elementTop - window.innerHeight, elementTop, elementTop + window.innerHeight],
    [0, 1, 0]
  )

  return (
    <motion.div
      ref={ref}
      style={{
        y: y,
        opacity: opacity
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
