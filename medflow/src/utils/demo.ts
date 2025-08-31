/**
 * Demo Mode Utility for MedFlow
 * Provides demo mode detection and mock data management
 */

// Demo mode detection
export const isDemoMode = (): boolean => {
  console.log('🔍 Debug: Checking demo mode...')
  
  // Check for demo mode in localStorage
  if (typeof window !== 'undefined') {
    const demoMode = localStorage.getItem('medflow-demo-mode')
    console.log('🔍 Debug: localStorage demo mode:', demoMode)
    if (demoMode === 'true') {
      console.log('🔍 Debug: Demo mode enabled via localStorage')
      return true
    }
  }
  
  // Check for demo mode in environment variables
  // VITE_DEMO_MODE can be 'true', 'false', or undefined
  const envDemoMode = import.meta.env.VITE_DEMO_MODE
  console.log('🔍 Debug: VITE_DEMO_MODE:', envDemoMode, 'Type:', typeof envDemoMode)
  
  if (envDemoMode === 'true') {
    console.log('🔍 Debug: Demo mode enabled via environment variable')
    return true
  }
  if (envDemoMode === 'false') {
    console.log('🔍 Debug: Demo mode disabled via environment variable')
    return false
  }
  
  // Check for demo mode in URL parameters
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const urlDemo = urlParams.get('demo')
    console.log('🔍 Debug: URL demo parameter:', urlDemo)
    if (urlDemo === 'true') {
      console.log('🔍 Debug: Demo mode enabled via URL parameter')
      return true
    }
  }
  
  // Default to false if not explicitly set
  console.log('🔍 Debug: Demo mode defaulting to false')
  return false
}

// Demo data management
class DemoDataManager {
  private appointments = new Map<string, any>()
  private users = new Map<string, any>()
  private documents = new Map<string, any>()
  
  constructor() {
    this.initializeDemoData()
  }
  
  private initializeDemoData() {
    // Initialize with some demo appointments
    this.addDemoAppointment({
      id: 'demo-appointment-1',
      patientName: 'John Doe',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '09:00',
      type: 'Consultation',
      status: 'Scheduled'
    })
    
    this.addDemoAppointment({
      id: 'demo-appointment-2',
      patientName: 'Jane Smith',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      time: '14:30',
      type: 'Follow-up',
      status: 'Confirmed'
    })
    
    // Initialize with demo users
    this.addDemoUser({
      id: 'demo-user-1',
      name: 'Demo Doctor',
      email: 'doctor@demo.com',
      role: 'DOCTOR'
    })
    
    this.addDemoUser({
      id: 'demo-user-2',
      name: 'Demo Nurse',
      email: 'nurse@demo.com',
      role: 'NURSE'
    })
  }
  
  // Appointment management
  addDemoAppointment(appointment: any) {
    this.appointments.set(appointment.id, {
      ...appointment,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
  
  updateDemoAppointment(id: string, updates: any) {
    const appointment = this.appointments.get(id)
    if (appointment) {
      this.appointments.set(id, {
        ...appointment,
        ...updates,
        updatedAt: new Date()
      })
    }
  }
  
  deleteDemoAppointment(id: string) {
    this.appointments.delete(id)
  }
  
  getDemoAppointments() {
    return Array.from(this.appointments.values())
  }
  
  getDemoAppointment(id: string) {
    return this.appointments.get(id)
  }
  
  // User management
  addDemoUser(user: any) {
    this.users.set(user.id, {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
  
  updateDemoUser(id: string, updates: any) {
    const user = this.users.get(id)
    if (user) {
      this.users.set(id, {
        ...user,
        ...updates,
        updatedAt: new Date()
      })
    }
  }
  
  deleteDemoUser(id: string) {
    this.users.delete(id)
  }
  
  getDemoUsers() {
    return Array.from(this.users.values())
  }
  
  getDemoUser(id: string) {
    return this.users.get(id)
  }
  
  // Document management
  addDemoDocument(document: any) {
    this.documents.set(document.id, {
      ...document,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  }
  
  updateDemoDocument(id: string, updates: any) {
    const document = this.documents.get(id)
    if (document) {
      this.documents.set(id, {
        ...document,
        ...updates,
        updatedAt: new Date()
      })
    }
  }
  
  deleteDemoDocument(id: string) {
    this.documents.delete(id)
  }
  
  getDemoDocuments() {
    return Array.from(this.documents.values())
  }
  
  getDemoDocument(id: string) {
    return this.documents.get(id)
  }
  
  // Clear all demo data
  clearDemoData() {
    this.appointments.clear()
    this.users.clear()
    this.documents.clear()
    this.initializeDemoData()
  }
  
  // Get demo data summary
  getDemoDataSummary() {
    return {
      appointments: this.appointments.size,
      users: this.users.size,
      documents: this.documents.size,
      totalRecords: this.appointments.size + this.users.size + this.documents.size
    }
  }
}

// Create singleton instance
export const demoDataManager = new DemoDataManager()

// Demo mode toggle functions
export const toggleDemoMode = (): boolean => {
  const newMode = !isDemoMode()
  if (typeof window !== 'undefined') {
    localStorage.setItem('medflow-demo-mode', newMode.toString())
  }
  return newMode
}

export const enableDemoMode = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('medflow-demo-mode', 'true')
  }
}

export const disableDemoMode = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('medflow-demo-mode')
  }
}

// Demo data export/import
export const exportDemoData = (): string => {
  return JSON.stringify({
    appointments: demoDataManager.getDemoAppointments().map(app => [app.id, app]),
    users: demoDataManager.getDemoUsers().map(user => [user.id, user]),
    documents: demoDataManager.getDemoDocuments().map(doc => [doc.id, doc])
  }, null, 2)
}

export const importDemoData = (data: string): boolean => {
  try {
    const parsed = JSON.parse(data)
    if (parsed.appointments) {
      parsed.appointments.forEach(([id, appointment]: [string, any]) => {
        demoDataManager.addDemoAppointment({ ...appointment, id })
      })
    }
    if (parsed.users) {
      parsed.users.forEach(([id, user]: [string, any]) => {
        demoDataManager.addDemoUser({ ...user, id })
      })
    }
    if (parsed.documents) {
      parsed.documents.forEach(([id, document]: [string, any]) => {
        demoDataManager.addDemoDocument({ ...document, id })
      })
    }
    return true
  } catch (error) {
    console.error('Failed to import demo data:', error)
    return false
  }
}

// Demo mode status check
export const getDemoModeStatus = () => {
  return {
    isDemoMode: isDemoMode(),
    dataSummary: demoDataManager.getDemoDataSummary(),
    localStorageKey: typeof window !== 'undefined' ? localStorage.getItem('medflow-demo-mode') : null,
    environmentVariable: import.meta.env.VITE_DEMO_MODE,
    urlParameter: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('demo') : null
  }
}

// Demo mode utilities for testing
export const resetDemoMode = (): void => {
  disableDemoMode()
  demoDataManager.clearDemoData()
}

export const setDemoModeForTesting = (enabled: boolean): void => {
  if (enabled) {
    enableDemoMode()
  } else {
    disableDemoMode()
  }
}

// Demo data types
export interface DemoAppointment {
  id: string
  patientName: string
  dateTime: Date
  symptoms: string
  notes: string
  status: 'scheduled' | 'completed' | 'no_show'
  userId: string // User ID for the new ADMIN/USER role system
  createdAt: Date
  updatedAt: Date
}

export interface DemoUser {
  uid: string
  email: string
  displayName: string
  role: string
  lastActivity: Date
}

// Demo data functions
export async function getDemoAppointments(userId?: string): Promise<DemoAppointment[]> {
  const demoManager = new DemoDataManager()
  const appointments = Array.from(demoManager['appointments'].values())
  
  if (userId) {
    return appointments.filter(appointment => appointment.userId === userId)
  }
  
  return appointments
}

export async function addDemoAppointment(appointmentData: Omit<DemoAppointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const demoManager = new DemoDataManager()
  const id = `demo-appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const appointment: DemoAppointment = {
    ...appointmentData,
    id,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  demoManager['appointments'].set(id, appointment)
  return id
}

export async function updateDemoAppointment(id: string, updates: Partial<DemoAppointment>): Promise<void> {
  const demoManager = new DemoDataManager()
  const appointment = demoManager['appointments'].get(id)
  
  if (appointment) {
    const updatedAppointment: DemoAppointment = {
      ...appointment,
      ...updates,
      updatedAt: new Date()
    }
    demoManager['appointments'].set(id, updatedAppointment)
  }
}

export async function deleteDemoAppointment(id: string): Promise<void> {
  const demoManager = new DemoDataManager()
  demoManager['appointments'].delete(id)
}

// Demo subscription functions for real-time updates
export function subscribeToDemoAppointments(
  callback: (appointments: any[]) => void,
  userId?: string
): () => void {
  // Simulate real-time updates by calling callback immediately
  // and setting up a periodic refresh
  const updateAppointments = () => {
    // Get appointments from the demo manager instance
    const demoManager = new DemoDataManager()
    const appointments = Array.from(demoManager['appointments'].values())
    callback(appointments)
  }
  
  // Initial call
  updateAppointments()
  
  // Set up periodic updates every 5 seconds
  const interval = setInterval(updateAppointments, 5000)
  
  // Return unsubscribe function
  return () => {
    clearInterval(interval)
  }
}

export function subscribeToDemoUsers(
  callback: (users: any[]) => void
): () => void {
  // Simulate real-time updates
  const updateUsers = () => {
    const demoManager = new DemoDataManager()
    const users = Array.from(demoManager['users'].values())
    callback(users)
  }
  
  // Initial call
  updateUsers()
  
  // Set up periodic updates every 10 seconds
  const interval = setInterval(updateUsers, 10000)
  
  // Return unsubscribe function
  return () => {
    clearInterval(interval)
  }
}



