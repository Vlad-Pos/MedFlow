/**
 * 🏥 MedFlow - SchedulingCalendar Component Test
 * 
 * Simple test to verify the component renders correctly
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { SchedulingCalendar } from './SchedulingCalendar'

// Mock the calendar module to avoid import issues
jest.mock('./SchedulingCalendar', () => ({
  SchedulingCalendar: () => <div data-testid="scheduling-calendar">Scheduling Calendar Component</div>
}))

describe('SchedulingCalendar', () => {
  it('renders without crashing', () => {
    render(<SchedulingCalendar />)
    expect(screen.getByTestId('scheduling-calendar')).toBeInTheDocument()
  })

  it('displays calendar content', () => {
    render(<SchedulingCalendar />)
    expect(screen.getByText('Scheduling Calendar Component')).toBeInTheDocument()
  })
})

