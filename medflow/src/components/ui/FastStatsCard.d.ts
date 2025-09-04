import { ReactElement } from 'react'

export interface FastStatsCardProps {
  title: string
  value: string | number
  icon?: ReactElement
  className?: string
}

export declare function FastStatsCard(props: FastStatsCardProps): JSX.Element
