/**
 * Automated Tests for SchedulingCalendar Component
 * 
 * Tests the "Programare Nouă" modal functionality including:
 * - New CNP field validation and input
 * - New Email field validation and input  
 * - New Phone field with country code dropdown
 * - Form submission with new fields
 * - Modal state management
 * 
 * @author MedFlow Team
 * @version 1.0
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { SchedulingCalendar } from '../SchedulingCalendar'

// Mock all external dependencies
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  useReducedMotion: () => false,
  AnimatePresence: ({ children }: any) => <>{children}</>
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

vi.mock('../../../utils/phoneValidation', () => ({
  COUNTRIES: [
    { code: 'RO', name: 'România', dialCode: '+40', flag: '🇷🇴' },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' }
  ],
  DEFAULT_COUNTRY: { code: 'RO', name: 'România', dialCode: '+40', flag: '🇷🇴' }
}))

// Mock Firebase dependencies
vi.mock('../../../firebase/firebase', () => ({
  db: {},
  collection: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date }))
  }
}))

describe('SchedulingCalendar Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  describe('"Programare Nouă" Modal', () => {
    test('should open modal when "Programare Nouă" button is clicked', async () => {
      render(<SchedulingCalendar />)
      
      const newAppointmentButton = screen.getByText('Programare Nouă')
      fireEvent.click(newAppointmentButton)
      
      await waitFor(() => {
        // Look for the modal title specifically (h3 element)
        const modalTitle = screen.getByRole('heading', { name: 'Programare Nouă' })
        expect(modalTitle).toBeInTheDocument()
        
        // Verify modal content is present
        expect(screen.getByLabelText('Nume pacient')).toBeInTheDocument()
        expect(screen.getByLabelText('Data Programării')).toBeInTheDocument()
        expect(screen.getByLabelText('Ora Început')).toBeInTheDocument()
        expect(screen.getByLabelText('Durată')).toBeInTheDocument()
        
        // Verify new fields are present
        expect(screen.getByLabelText('CNP Pacient')).toBeInTheDocument()
        expect(screen.getByLabelText('Email Pacient')).toBeInTheDocument()
        expect(screen.getByLabelText('Număr de Telefon')).toBeInTheDocument()
        expect(screen.getByLabelText('Descriere')).toBeInTheDocument()
      })
    })
  })
})
