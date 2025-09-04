import React, { memo } from 'react'
import { ContainerProps } from './Container.types'
import {
  CONTAINER_BASE_CLASSES,
  CONTAINER_SIZE_CLASSES,
  CONTAINER_PADDING_CLASSES,
  CONTAINER_MARGIN_CLASSES,
  CONTAINER_CENTER_CLASSES,
  CONTAINER_FLEX_CLASSES
} from './Container.styles'

const Container = memo<ContainerProps>(({
  children,
  size = 'md',
  padding = 'md',
  margin = 'none',
  className = '',
  center = false,
  flex = false
}) => {
  const containerClasses = `
    ${CONTAINER_BASE_CLASSES}
    ${CONTAINER_SIZE_CLASSES[size]}
    ${CONTAINER_PADDING_CLASSES[padding]}
    ${CONTAINER_MARGIN_CLASSES[margin]}
    ${center ? CONTAINER_CENTER_CLASSES : ''}
    ${flex ? CONTAINER_FLEX_CLASSES : ''}
    ${className}
  `.trim()

  return (
    <div className={containerClasses}>
      {children}
    </div>
  )
})

Container.displayName = 'Container'

export default Container
