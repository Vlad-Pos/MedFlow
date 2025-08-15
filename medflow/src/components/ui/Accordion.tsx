import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface AccordionItemProps {
  title: string
  children: React.ReactNode
  isOpen?: boolean
  onToggle?: () => void
  className?: string
}

interface AccordionProps {
  items: Array<{
    title: string
    content: React.ReactNode
  }>
  allowMultiple?: boolean
  defaultOpen?: number[]
  className?: string
}

export function AccordionItem({ title, children, isOpen, onToggle, className = '' }: AccordionItemProps) {
  return (
    <div className={`border-b border-gray-200 last:border-b-0 ${className}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-0 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--medflow-brand-1)] focus:ring-offset-2 rounded-lg"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span className="text-lg font-medium text-gray-900">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-4"
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            id={`accordion-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="pb-4 px-0 text-gray-600 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Accordion({ items, allowMultiple = false, defaultOpen = [], className = '' }: AccordionProps) {
  const [openItems, setOpenItems] = useState<number[]>(defaultOpen)

  const toggleItem = (index: number) => {
    if (allowMultiple) {
      setOpenItems(prev => 
        prev.includes(index) 
          ? prev.filter(i => i !== index)
          : [...prev, index]
      )
    } else {
      setOpenItems(prev => 
        prev.includes(index) ? [] : [index]
      )
    }
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          isOpen={openItems.includes(index)}
          onToggle={() => toggleItem(index)}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  )
}
