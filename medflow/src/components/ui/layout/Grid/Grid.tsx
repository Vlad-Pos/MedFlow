import React, { memo } from 'react'
import { GridProps, GridItemProps } from './Grid.types'
import {
  GRID_BASE_CLASSES,
  GRID_COLUMNS_CLASSES,
  GRID_GAP_CLASSES,
  GRID_RESPONSIVE_CLASSES,
  GRID_ALIGNMENT_CLASSES,
  GRID_JUSTIFY_CLASSES
} from './Grid.styles'

const Grid = memo<GridProps>(({
  children,
  columns = 1,
  gap = 'md',
  responsive = true,
  alignment = 'stretch',
  justify = 'start',
  className = ''
}) => {
  const gridClasses = `
    ${GRID_BASE_CLASSES}
    ${GRID_COLUMNS_CLASSES[columns]}
    ${GRID_GAP_CLASSES[gap]}
    ${responsive ? GRID_RESPONSIVE_CLASSES.md : ''}
    ${GRID_ALIGNMENT_CLASSES[alignment]}
    ${GRID_JUSTIFY_CLASSES[justify]}
    ${className}
  `.trim()

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
})

Grid.displayName = 'Grid'

export const GridItem = memo<GridItemProps>(({ children, span = 1, className = '' }) => {
  const spanClass = span > 1 ? `col-span-${span}` : ''
  
  return (
    <div className={`${spanClass} ${className}`}>
      {children}
    </div>
  )
})

GridItem.displayName = 'GridItem'

export default Grid
