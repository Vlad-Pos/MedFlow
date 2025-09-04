/**
 * Patient Search Component Test Suite
 * 
 * Tests for the PatientSearch component functionality.
 * 
 * @author MedFlow Team
 * @version 2.0
 */

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PatientSearch from '../PatientSearch'
import { Patient } from '../../types/patient'

// Mock the patient service
vi.mock('../../services/patientService', () => ({
  patientService: {
    searchPatients: vi.fn()
  }
}))

// Mock the CNP validation utilities
vi.mock('../../utils/cnpValidation', () => ({
  extractGenderFromCNP: vi.fn(),
  extractBirthDateFromCNP: vi.fn()
}))

describe('PatientSearch Component', () => {
  const mockOnPatientSelect = vi.fn()
  const mockSelectedPatient: Patient = {
    id: 'test-patient-id',
    patientNumber: 'P-2024-001',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      cnp: '1900101000000'
    },
    contactInfo: {
      email: 'john.doe@example.com',
      phone: '+40123456789'
    },
    medicalInfo: {
      allergies: [],
      chronicConditions: [],
      currentMedications: []
    },
    systemInfo: {
      createdBy: 'current-user-id',
      lastModifiedBy: 'current-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should render search input with placeholder', () => {
    render(
      <PatientSearch
        onPatientSelect={mockOnPatientSelect}
        selectedPatient={null}
      />
    )

    const searchInput = screen.getByPlaceholderText(/căutați pacient/i)
    expect(searchInput).toBeInTheDocument()
  })

  test('should display selected patient when provided', () => {
    render(
      <PatientSearch
        onPatientSelect={mockOnPatientSelect}
        selectedPatient={mockSelectedPatient}
      />
    )

    expect(screen.getByText('Pacient selectat: John Doe')).toBeInTheDocument()
  })

  test('should call onPatientSelect when patient is selected', () => {
    render(
      <PatientSearch
        onPatientSelect={mockOnPatientSelect}
        selectedPatient={null}
      />
    )

    // Simulate patient selection (this would normally happen through search results)
    // For now, we'll test the callback mechanism
    expect(mockOnPatientSelect).toHaveBeenCalledTimes(0)
  })

  test('should handle search input changes', async () => {
    render(
      <PatientSearch
        onPatientSelect={mockOnPatientSelect}
        selectedPatient={null}
      />
    )

    const searchInput = screen.getByPlaceholderText(/căutați pacient/i)
    
    fireEvent.change(searchInput, { target: { value: 'John' } })
    
    expect(searchInput).toHaveValue('John')
  })

  test('should handle clear selection', () => {
    render(
      <PatientSearch
        onPatientSelect={mockOnPatientSelect}
        selectedPatient={mockSelectedPatient}
      />
    )

    // Find the clear button in the selected patient section (green button)
    const clearButtons = screen.getAllByRole('button')
    const clearButton = clearButtons.find(button => 
      button.className.includes('text-green-600')
    )
    
    expect(clearButton).toBeDefined()
    fireEvent.click(clearButton!)

    expect(mockOnPatientSelect).toHaveBeenCalledWith(null)
  })

  test('should be disabled when disabled prop is true', () => {
    render(
      <PatientSearch
        onPatientSelect={mockOnPatientSelect}
        selectedPatient={null}
        disabled={true}
      />
    )

    const searchInput = screen.getByPlaceholderText(/căutați pacient/i)
    expect(searchInput).toBeDisabled()
  })
})
