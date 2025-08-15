import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { CardProps, CardHeaderProps, CardContentProps, CardFooterProps, CardTitleProps, CardSubtitleProps } from './Card.types'
import {
  CARD_BASE_CLASSES,
  CARD_SIZE_CLASSES,
  CARD_VARIANT_CLASSES,
  CARD_HOVER_CLASSES,
  CARD_HEADER_CLASSES,
  CARD_CONTENT_CLASSES,
  CARD_FOOTER_CLASSES,
  CARD_TITLE_CLASSES,
  CARD_SUBTITLE_CLASSES
} from './Card.styles'

const Card = memo<CardProps>(({
  children,
  size = 'md',
  variant = 'default',
  className = '',
  onClick,
  hoverable = true
}) => {
  const cardClasses = `
    ${CARD_BASE_CLASSES}
    ${CARD_SIZE_CLASSES[size]}
    ${CARD_VARIANT_CLASSES[variant]}
    ${hoverable ? CARD_HOVER_CLASSES[variant] : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim()

  const cardProps = {
    className: cardClasses,
    onClick,
    whileHover: hoverable && onClick ? { scale: 1.02, y: -2 } : {},
    whileTap: onClick ? { scale: 0.98 } : {}
  }

  return (
    <motion.div {...cardProps}>
      {children}
    </motion.div>
  )
})

Card.displayName = 'Card'

export const CardHeader = memo<CardHeaderProps>(({ children, className = '' }) => (
  <div className={`${CARD_HEADER_CLASSES} ${className}`}>
    {children}
  </div>
))

CardHeader.displayName = 'CardHeader'

export const CardFooter = memo<CardFooterProps>(({ children, className = '' }) => (
  <div className={`${CARD_FOOTER_CLASSES} ${className}`}>
    {children}
  </div>
))

CardFooter.displayName = 'CardFooter'

export const CardTitle = memo<CardTitleProps>(({ children, className = '' }) => (
  <h3 className={`${CARD_TITLE_CLASSES} ${className}`}>
    {children}
  </h3>
))

CardTitle.displayName = 'CardTitle'

export const CardSubtitle = memo<CardSubtitleProps>(({ children, className = '' }) => (
  <p className={`${CARD_SUBTITLE_CLASSES} ${className}`}>
    {children}
  </p>
))

CardSubtitle.displayName = 'CardSubtitle'

export const CardContent = memo<CardContentProps>(({ children, className = '' }) => (
  <div className={`${CARD_CONTENT_CLASSES} ${className}`}>
    {children}
  </div>
))

CardContent.displayName = 'CardContent'

export default Card
