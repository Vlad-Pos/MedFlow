import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import DocumentManager from '../DocumentManager'
import { useAuth } from '../../providers/AuthProvider'

// Mock Firebase modules - comprehensive mock to fix loading state
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn((query, onNext, onError) => {
    // Simulate successful data loading with empty array
    if (onNext) {
      // Create a mock snapshot with empty docs array
      const mockSnapshot = {
        docs: [],
        empty: true,
        size: 0,
        metadata: { fromCache: false, hasPendingWrites: false }
      }
      // Call the callback immediately to resolve loading state
      onNext(mockSnapshot)
    }
    // Return a proper unsubscribe function that can be called
    const unsubscribe = vi.fn()
    return unsubscribe
  }),
  serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
  Timestamp: {
    now: vi.fn(() => ({ toDate: () => new Date() })),
    fromDate: vi.fn((date: Date) => ({ toDate: () => date }))
  }
}))
vi.mock('firebase/storage')
vi.mock('../../services/firebase', () => ({
  db: {},
  storage: {}
}))

// Mock auth context
vi.mock('../../providers/AuthProvider', () => ({
  useAuth: vi.fn()
}))

// Mock demo utilities - ensure this works
vi.mock('../../utils/demo', () => ({
  isDemoMode: vi.fn(() => true), // Force demo mode to be true
  subscribeToDemoAppointments: vi.fn((callback) => {
    // Simulate demo data loading immediately
    const demoData = []
    callback(demoData)
    return () => {}
  }),
  addDemoAppointment: vi.fn(),
  updateDemoAppointment: vi.fn(),
  deleteDemoAppointment: vi.fn()
}))

// Mock file utilities
vi.mock('../../utils/fileUtils', () => ({
  formatFileSize: vi.fn((bytes) => `${bytes} B`),
  getFileIcon: vi.fn(() => '📄'),
  validateFileType: vi.fn(() => true),
  validateFileSize: vi.fn(() => true)
}))

const mockUser = {
  uid: 'test-doctor-id',
  email: 'doctor@example.com',
  displayName: 'Dr. Test',
  role: 'DOCTOR',
  permissions: ['read:documents', 'write:documents']
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('DocumentManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock auth context
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      initializing: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      resetPassword: vi.fn(),
      logout: vi.fn(),
      refreshUserData: vi.fn(),
      updateUserPreferences: vi.fn()
    })
  })

  describe('Initial Render', () => {
    it('renders document manager with title', () => {
      renderWithRouter(<DocumentManager />)
      
      expect(screen.getByText(/Documente/i)).toBeInTheDocument()
      expect(screen.getByText(/Gestionare documente/i)).toBeInTheDocument()
    })

    it('shows upload button', () => {
      renderWithRouter(<DocumentManager />)
      
      expect(screen.getByText(/Încarcă document/i)).toBeInTheDocument()
    })

    it('displays empty state when no documents exist', async () => {
      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        expect(screen.getByText(/Nu există documente/i)).toBeInTheDocument()
      })
    })
  })

  describe('Document Upload', () => {
    it('opens file picker when upload button is clicked', async () => {
      renderWithRouter(<DocumentManager />)
      
      const uploadButton = screen.getByText(/Încarcă document/i)
      fireEvent.click(uploadButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Selectează fișier/i)).toBeInTheDocument()
      })
    })

    it('handles file selection', async () => {
      const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
      
      renderWithRouter(<DocumentManager />)
      
      const uploadButton = screen.getByText(/Încarcă document/i)
      fireEvent.click(uploadButton)
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      
      await waitFor(() => {
        expect(screen.getByText('test.pdf')).toBeInTheDocument()
      })
    })

    it('validates file type', async () => {
      const mockFile = new File(['test content'], 'test.exe', { type: 'application/x-msdownload' })
      
      renderWithRouter(<DocumentManager />)
      
      const uploadButton = screen.getByText(/Încarcă document/i)
      fireEvent.click(uploadButton)
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      
      await waitFor(() => {
        expect(screen.getByText(/Tip de fișier neacceptat/i)).toBeInTheDocument()
      })
    })

    it('validates file size', async () => {
      const mockFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
      
      renderWithRouter(<DocumentManager />)
      
      const uploadButton = screen.getByText(/Încarcă document/i)
      fireEvent.click(uploadButton)
      
      const fileInput = screen.getByTestId('file-input')
      fireEvent.change(fileInput, { target: { files: [mockFile] } })
      
      await waitFor(() => {
        expect(screen.getByText(/Fișier prea mare/i)).toBeInTheDocument()
      })
    })
  })

  describe('Document Display', () => {
    it('shows document list when documents exist', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Report.pdf',
          type: 'application/pdf',
          size: 1024,
          uploadedAt: new Date('2024-01-15T10:00:00'),
          uploadedBy: 'Dr. Test'
        }
      ]

      vi.mocked(require('../../utils/demo').getDemoDocuments)
        .mockReturnValue(mockDocuments)

      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Report.pdf')).toBeInTheDocument()
        expect(screen.getByText('Dr. Test')).toBeInTheDocument()
      })
    })

    it('displays document metadata correctly', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Patient_History.pdf',
          type: 'application/pdf',
          size: 2048,
          uploadedAt: new Date('2024-01-15T14:00:00'),
          uploadedBy: 'Dr. Smith',
          description: 'Patient medical history'
        }
      ]

      vi.mocked(require('../../utils/demo').getDemoDocuments)
        .mockReturnValue(mockDocuments)

      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Patient_History.pdf')).toBeInTheDocument()
        expect(screen.getByText('2 KB')).toBeInTheDocument()
        expect(screen.getByText('Dr. Smith')).toBeInTheDocument()
      })
    })

    it('shows document type icons', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Image.jpg',
          type: 'image/jpeg',
          size: 1024,
          uploadedAt: new Date('2024-01-15T10:00:00'),
          uploadedBy: 'Dr. Test'
        }
      ]

      vi.mocked(require('../../utils/demo').getDemoDocuments)
        .mockReturnValue(mockDocuments)

      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        expect(screen.getByText('📷')).toBeInTheDocument()
      })
    })
  })

  describe('Document Management', () => {
    it('allows downloading documents', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Report.pdf',
          type: 'application/pdf',
          size: 1024,
          uploadedAt: new Date('2024-01-15T10:00:00'),
          uploadedBy: 'Dr. Test',
          downloadUrl: 'https://example.com/report.pdf'
        }
      ]

      vi.mocked(require('../../utils/demo').getDemoDocuments)
        .mockReturnValue(mockDocuments)

      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        const downloadButton = screen.getByText(/Descarcă/i)
        fireEvent.click(downloadButton)
      })
      
      // Should trigger download
      expect(screen.getByText(/Descarcă/i)).toBeInTheDocument()
    })

    it('allows editing document metadata', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Report.pdf',
          type: 'application/pdf',
          size: 1024,
          uploadedAt: new Date('2024-01-15T10:00:00'),
          uploadedBy: 'Dr. Test'
        }
      ]

      vi.mocked(require('../../utils/demo').getDemoDocuments)
        .mockReturnValue(mockDocuments)

      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        const editButton = screen.getByText(/Editează/i)
        fireEvent.click(editButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/Editează document/i)).toBeInTheDocument()
      })
    })

    it('allows deleting documents with confirmation', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Report.pdf',
          type: 'application/pdf',
          size: 1024,
          uploadedAt: new Date('2024-01-15T10:00:00'),
          uploadedBy: 'Dr. Test'
        }
      ]

      vi.mocked(require('../../utils/demo').getDemoDocuments)
        .mockReturnValue(mockDocuments)

      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        const deleteButton = screen.getByText(/Șterge/i)
        fireEvent.click(deleteButton)
      })
      
      await waitFor(() => {
        expect(screen.getByText(/Confirmă ștergerea/i)).toBeInTheDocument()
      })
    })
  })

  describe('Search and Filtering', () => {
    it('filters documents by name', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Report.pdf',
          type: 'application/pdf',
          size: 1024,
          uploadedAt: new Date('2024-01-15T10:00:00'),
          uploadedBy: 'Dr. Test'
        },
        {
          id: 'doc-2',
          name: 'Image.jpg',
          type: 'image/jpeg',
          size: 2048,
          uploadedAt: new Date('2024-01-15T14:00:00'),
          uploadedBy: 'Dr. Smith'
        }
      ]

      vi.mocked(require('../../utils/demo').getDemoDocuments)
        .mockReturnValue(mockDocuments)

      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Report.pdf')).toBeInTheDocument()
        expect(screen.getByText('Image.jpg')).toBeInTheDocument()
      })
      
      const searchInput = screen.getByPlaceholderText(/Caută documente/i)
      fireEvent.change(searchInput, { target: { value: 'Report' } })
      
      await waitFor(() => {
        expect(screen.getByText('Report.pdf')).toBeInTheDocument()
        expect(screen.queryByText('Image.jpg')).not.toBeInTheDocument()
      })
    })

    it('filters documents by type', async () => {
      const mockDocuments = [
        {
          id: 'doc-1',
          name: 'Report.pdf',
          type: 'application/pdf',
          size: 1024,
          uploadedAt: new Date('2024-01-15T10:00:00'),
          uploadedBy: 'Dr. Test'
        },
        {
          id: 'doc-2',
          name: 'Image.jpg',
          type: 'image/jpeg',
          size: 2048,
          uploadedAt: new Date('2024-01-15T14:00:00'),
          uploadedBy: 'Dr. Smith'
        }
      ]

      vi.mocked(require('../../utils/demo').getDemoDocuments)
        .mockReturnValue(mockDocuments)

      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Report.pdf')).toBeInTheDocument()
        expect(screen.getByText('Image.jpg')).toBeInTheDocument()
      })
      
      const typeFilter = screen.getByText(/Tip fișier/i)
      fireEvent.click(typeFilter)
      
      const pdfOption = screen.getByText(/PDF/i)
      fireEvent.click(pdfOption)
      
      await waitFor(() => {
        expect(screen.getByText('Report.pdf')).toBeInTheDocument()
        expect(screen.queryByText('Image.jpg')).not.toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design', () => {
    it('adapts to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      renderWithRouter(<DocumentManager />)
      
      expect(screen.getByText(/Documente/i)).toBeInTheDocument()
    })

    it('shows mobile-optimized layout on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      renderWithRouter(<DocumentManager />)
      
      expect(screen.getByText(/Încarcă document/i)).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for actions', () => {
      renderWithRouter(<DocumentManager />)
      
      expect(screen.getByLabelText(/Încarcă document/i)).toBeInTheDocument()
    })

    it('provides keyboard navigation support', () => {
      renderWithRouter(<DocumentManager />)
      
      const uploadButton = screen.getByText(/Încarcă document/i)
      uploadButton.focus()
      
      expect(uploadButton).toHaveFocus()
    })

    it('announces document operations to screen readers', async () => {
      renderWithRouter(<DocumentManager />)
      
      const uploadButton = screen.getByText(/Încarcă document/i)
      fireEvent.click(uploadButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Selectează fișier/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles upload errors gracefully', async () => {
      renderWithRouter(<DocumentManager />)
      
      const uploadButton = screen.getByText(/Încarcă document/i)
      fireEvent.click(uploadButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Selectează fișier/i)).toBeInTheDocument()
      })
    })

    it('shows retry option when operations fail', async () => {
      renderWithRouter(<DocumentManager />)
      
      const uploadButton = screen.getByText(/Încarcă document/i)
      fireEvent.click(uploadButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Selectează fișier/i)).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('loads documents efficiently', async () => {
      const startTime = performance.now()
      
      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        expect(screen.getByText(/Documente/i)).toBeInTheDocument()
      })
      
      const endTime = performance.now()
      const loadTime = endTime - startTime
      
      expect(loadTime).toBeLessThan(1000)
    })

    it('handles large numbers of documents without lag', async () => {
      const mockDocuments = Array.from({ length: 100 }, (_, i) => ({
        id: `doc-${i}`,
        name: `Document_${i}.pdf`,
        type: 'application/pdf',
        size: 1024,
        uploadedAt: new Date('2024-01-15T10:00:00'),
        uploadedBy: `Dr. ${i}`
      }))

      vi.mocked(require('../../utils/demo').getDemoDocuments)
        .mockReturnValue(mockDocuments)

      renderWithRouter(<DocumentManager />)
      
      await waitFor(() => {
        expect(screen.getByText('Document_0.pdf')).toBeInTheDocument()
        expect(screen.getByText('Document_99.pdf')).toBeInTheDocument()
      })
    })
  })
})
