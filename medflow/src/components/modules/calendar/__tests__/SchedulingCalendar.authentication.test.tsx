/**
 * Test for Authentication Check in SchedulingCalendar
 * 
 * This test verifies that the component properly checks authentication
 * before allowing appointment creation.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { SchedulingCalendar } from '../SchedulingCalendar'

// Mock Firebase dependencies
const mockAuth = {
  currentUser: null // Simulate unauthenticated user
}

vi.mock('../../../services/firebase', () => ({
  auth: mockAuth
}))

// Mock createAppointment to verify it's not called
const mockCreateAppointment = vi.fn()
vi.mock('../../../utils/appointmentUtils', () => ({
  createAppointment: mockCreateAppointment
}))

// Mock other dependencies
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  useReducedMotion: () => false
}))

vi.mock('date-fns', () => ({
  format: vi.fn(() => 'January 2024'),
  startOfMonth: vi.fn((date) => date),
  endOfMonth: vi.fn((date) => date),
  eachDayOfInterval: vi.fn(() => [new Date()]),
  startOfWeek: vi.fn((date) => date),
  endOfWeek: vi.fn((date) => date)
}))

vi.mock('date-fns/locale', () => ({
  ro: {}
}))

vi.mock('lucide-react', () => ({
  ChevronLeft: () => <span>ChevronLeft</span>,
  ChevronRight: () => <span>ChevronRight</span>,
  Plus: () => <span>Plus</span>,
  Settings: () => <span>Settings</span>,
  Clock: () => <span>Clock</span>,
  MapPin: () => <span>MapPin</span>,
  Users: () => <span>Users</span>,
  Calendar: () => <span>Calendar</span>,
  X: () => <span>X</span>,
  Loader2: () => <span>Loader2</span>
}))

vi.mock('../../ui/feedback/LoadingSpinner', () => ({
  LoadingSpinner: () => <div>Loading...</div>
}))

vi.mock('../../ui/buttons/AnimatedButton', () => ({
  AnimatedButton: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  IconButton: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

vi.mock('../../ui/feedback/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <>{children}</>
}))

// Mock window.alert
const mockAlert = vi.fn()
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true
})

describe('SchedulingCalendar Authentication Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.currentUser = null // Ensure unauthenticated state
  })

  test('should prevent appointment creation for unauthenticated users', async () => {
    render(<SchedulingCalendar />)
    
    // Open modal
    const button = screen.getByText('Programare Nouă')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Programare Nouă')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Fill required fields
    const nameInput = screen.getByLabelText('Nume pacient')
    const dateInput = screen.getByLabelText('Data Programării')
    const startTimeInput = screen.getByLabelText('Ora Început')
    const durationInput = screen.getByLabelText('Durată')
    
    fireEvent.change(nameInput, { target: { value: 'Test Patient' } })
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } })
    fireEvent.change(startTimeInput, { target: { value: '10:00' } })
    fireEvent.change(durationInput, { target: { value: '60' } })
    
    // Submit form
    const submitButton = screen.getByText('Creează Programarea')
    fireEvent.click(submitButton)
    
    // Wait a bit to ensure the function has time to execute
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Trebuie să fiți autentificat pentru a crea programări. Vă rugăm să vă conectați.')
    }, { timeout: 3000 })
    
    // Verify createAppointment was NOT called
    expect(mockCreateAppointment).not.toHaveBeenCalled()
  })

  test('should allow appointment creation for authenticated users', async () => {
    // Mock authenticated user
    mockAuth.currentUser = { uid: 'test-user-id' }
    
    render(<SchedulingCalendar />)
    
    // Open modal
    const button = screen.getByText('Programare Nouă')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Programare Nouă')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Fill required fields
    const nameInput = screen.getByLabelText('Nume pacient')
    const dateInput = screen.getByLabelText('Data Programării')
    const startTimeInput = screen.getByLabelText('Ora Început')
    const durationInput = screen.getByLabelText('Durată')
    
    fireEvent.change(nameInput, { target: { value: 'Test Patient' } })
    fireEvent.change(dateInput, { target: { value: '2024-01-15' } })
    fireEvent.change(startTimeInput, { target: { value: '10:00' } })
    fireEvent.change(durationInput, { target: { value: '60' } })
    
    // Mock successful appointment creation
    mockCreateAppointment.mockResolvedValue('test-appointment-id')
    
    // Submit form
    const submitButton = screen.getByText('Creează Programarea')
    fireEvent.click(submitButton)
    
    // Wait for createAppointment to be called
    await waitFor(() => {
      expect(mockCreateAppointment).toHaveBeenCalled()
    }, { timeout: 3000 })
    
    // Verify the data sent includes the correct userId
    const appointmentData = mockCreateAppointment.mock.calls[0][0]
    expect(appointmentData.userId).toBe('test-user-id')
    expect(mockAlert).not.toHaveBeenCalled()
  })
})
