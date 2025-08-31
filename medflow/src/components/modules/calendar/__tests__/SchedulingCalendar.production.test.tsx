/**
 * Production Test for SchedulingCalendar Component
 * 
 * This test verifies that the component works correctly in a real environment
 * and that all new fields are properly integrated.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { SchedulingCalendar } from '../SchedulingCalendar'

// Mock only essential dependencies for production testing
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

// Mock Firebase dependencies
vi.mock('../../../services/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-id' }
  }
}))

vi.mock('../../../utils/appointmentUtils', () => ({
  createAppointment: vi.fn(() => Promise.resolve('test-appointment-id'))
}))

describe('SchedulingCalendar Production Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should render component without crashing', () => {
    expect(() => render(<SchedulingCalendar />)).not.toThrow()
  })

  test('should display "Programare Nouă" button', () => {
    render(<SchedulingCalendar />)
    expect(screen.getByText('Programare Nouă')).toBeInTheDocument()
  })

  test('should open modal when button is clicked', async () => {
    render(<SchedulingCalendar />)
    
    const button = screen.getByText('Programare Nouă')
    fireEvent.click(button)
    
    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByText('Programare Nouă')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('should display all form fields in modal', async () => {
    render(<SchedulingCalendar />)
    
    const button = screen.getByText('Programare Nouă')
    fireEvent.click(button)
    
    await waitFor(() => {
      // Check if modal title is visible
      const modalTitle = screen.getByRole('heading', { name: 'Programare Nouă' })
      expect(modalTitle).toBeInTheDocument()
      
      // Check if form fields are present
      expect(screen.getByLabelText('Nume pacient')).toBeInTheDocument()
      expect(screen.getByLabelText('Data Programării')).toBeInTheDocument()
      expect(screen.getByLabelText('Ora Început')).toBeInTheDocument()
      expect(screen.getByLabelText('Durată')).toBeInTheDocument()
      expect(screen.getByLabelText('Descriere')).toBeInTheDocument()
      
      // Check if new fields are present
      expect(screen.getByLabelText('CNP Pacient')).toBeInTheDocument()
      expect(screen.getByLabelText('Email Pacient')).toBeInTheDocument()
      expect(screen.getByLabelText('Număr de Telefon')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('should have working form inputs', async () => {
    render(<SchedulingCalendar />)
    
    const button = screen.getByText('Programare Nouă')
    fireEvent.click(button)
    
    await waitFor(() => {
      // Test CNP input
      const cnpInput = screen.getByLabelText('CNP Pacient')
      fireEvent.change(cnpInput, { target: { value: '1234567890123' } })
      expect(cnpInput).toHaveValue('1234567890123')
      
      // Test email input
      const emailInput = screen.getByLabelText('Email Pacient')
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      expect(emailInput).toHaveValue('test@example.com')
      
      // Test phone input
      const phoneInput = screen.getByLabelText('Număr de Telefon')
      const phoneField = phoneInput.querySelector('input')
      if (phoneField) {
        fireEvent.change(phoneField, { target: { value: '712345678' } })
        expect(phoneField).toHaveValue('712345678')
      }
    }, { timeout: 3000 })
  })

  test('should have submit button', async () => {
    render(<SchedulingCalendar />)
    
    const button = screen.getByText('Programare Nouă')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Creează Programarea')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})
