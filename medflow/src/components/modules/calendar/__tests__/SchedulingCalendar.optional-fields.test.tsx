/**
 * Test for Optional Fields Handling in SchedulingCalendar
 * 
 * This test verifies that optional fields (CNP, Email, Phone) are properly handled
 * and not sent as undefined to Firebase when they are empty.
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { SchedulingCalendar } from '../SchedulingCalendar'

// Mock Firebase dependencies
vi.mock('../../../services/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user-id' }
  }
}))

// Mock createAppointment to capture the data being sent
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

describe('SchedulingCalendar Optional Fields Test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateAppointment.mockResolvedValue('test-appointment-id')
  })

  test('should create appointment with only required fields when optional fields are empty', async () => {
    render(<SchedulingCalendar />)
    
    // Open modal
    const button = screen.getByText('Programare Nouă')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Programare Nouă')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Fill only required fields
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
    
    // Wait for createAppointment to be called
    await waitFor(() => {
      expect(mockCreateAppointment).toHaveBeenCalled()
    }, { timeout: 3000 })
    
    // Verify the data sent to Firebase
    const appointmentData = mockCreateAppointment.mock.calls[0][0]
    
    // Required fields should be present
    expect(appointmentData.patientName).toBe('Test Patient')
    expect(appointmentData.dateTime).toBeInstanceOf(Date)
    expect(appointmentData.status).toBe('scheduled')
    expect(appointmentData.userId).toBe('test-user-id')
    
    // Optional fields should NOT be present when empty
    expect(appointmentData).not.toHaveProperty('patientEmail')
    expect(appointmentData).not.toHaveProperty('patientPhone')
    expect(appointmentData).not.toHaveProperty('patientCNP')
    expect(appointmentData).not.toHaveProperty('patientBirthDate')
    expect(appointmentData).not.toHaveProperty('notes')
  })

  test('should include optional fields when they have values', async () => {
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
    
    // Fill optional fields
    const cnpInput = screen.getByLabelText('CNP Pacient')
    const emailInput = screen.getByLabelText('Email Pacient')
    const phoneInput = screen.getByLabelText('Număr de Telefon')
    const descriptionInput = screen.getByLabelText('Descriere')
    
    fireEvent.change(cnpInput, { target: { value: '1234567890123' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '712345678' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test appointment' } })
    
    // Submit form
    const submitButton = screen.getByText('Creează Programarea')
    fireEvent.click(submitButton)
    
    // Wait for createAppointment to be called
    await waitFor(() => {
      expect(mockCreateAppointment).toHaveBeenCalled()
    }, { timeout: 3000 })
    
    // Verify the data sent to Firebase
    const appointmentData = mockCreateAppointment.mock.calls[0][0]
    
    // Required fields should be present
    expect(appointmentData.patientName).toBe('Test Patient')
    expect(appointmentData.dateTime).toBeInstanceOf(Date)
    expect(appointmentData.status).toBe('scheduled')
    expect(appointmentData.userId).toBe('test-user-id')
    
    // Optional fields should be present when filled
    expect(appointmentData.patientCNP).toBe('1234567890123')
    expect(appointmentData.patientEmail).toBe('test@example.com')
    expect(appointmentData.patientPhone).toContain('+40 712345678')
    expect(appointmentData.notes).toBe('Test appointment')
    expect(appointmentData.patientBirthDate).toBeInstanceOf(Date)
  })
})
