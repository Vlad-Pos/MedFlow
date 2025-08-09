/**
 * Lazy Loading Image Component
 * Performance optimization for the n8n.io-inspired redesign
 */

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  quality?: number
}

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmMGYwZjAiLz48L3N2Zz4=',
  quality = 85
}: LazyImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setLoaded(true)
  }

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Placeholder */}
      <motion.img
        src={placeholder}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          filter: 'blur(20px)',
          background: 'linear-gradient(135deg, #1a1b1e, #24262a)'
        }}
      />

      {/* Actual image */}
      {inView && (
        <motion.img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: loaded ? 1 : 0,
            scale: loaded ? 1 : 1.1
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      {/* Loading indicator */}
      {!loaded && inView && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-8 h-8 border-2 border-[#ff7e5f] border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </div>
  )
}
