// Simple helper to detect demo mode when Firebase env is not configured
export function isDemoMode(): boolean {
  const explicit = import.meta.env.VITE_DEMO_MODE
  // If demo mode is explicitly enabled, use it regardless of Firebase config
  if (explicit === '1' || explicit === 'true') return true
  // If no API key or placeholder value, enable demo mode
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  return !apiKey || apiKey === 'YOUR_API_KEY'
}

// Demo appointments state management
let demoAppointments: any[] = []
let demoListeners: ((appointments: any[]) => void)[] = []

export function getDemoAppointments() {
  if (demoAppointments.length === 0) {
    // Initialize with default demo appointments
    const now = new Date()
    const d = (h: number, name: string, status: 'scheduled' | 'completed' | 'no_show') => ({
      id: `demo-${h}`,
      patientName: name,
      dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, 0, 0),
      status,
      symptoms: 'Simptome demo',
      notes: 'Note demo',
      doctorId: 'demo-user',
    })
    demoAppointments = [
      d(9, 'Ion Popescu', 'scheduled'),
      d(11, 'Maria Ionescu', 'completed'),
      d(13, 'George Enache', 'no_show'),
    ]
  }
  return demoAppointments
}

export function addDemoAppointment(appointment: any) {
  const newId = `demo-${Date.now()}`
  const newAppointment = { ...appointment, id: newId }
  demoAppointments.push(newAppointment)
  demoAppointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
  notifyDemoListeners()
  return newAppointment
}

export function updateDemoAppointment(id: string, updates: any) {
  const index = demoAppointments.findIndex(a => a.id === id)
  if (index !== -1) {
    demoAppointments[index] = { ...demoAppointments[index], ...updates }
    notifyDemoListeners()
  }
}

export function deleteDemoAppointment(id: string) {
  const index = demoAppointments.findIndex(a => a.id === id)
  if (index !== -1) {
    demoAppointments.splice(index, 1)
    notifyDemoListeners()
  }
}

export function subscribeToDemoAppointments(callback: (appointments: any[]) => void) {
  demoListeners.push(callback)
  // Immediately call with current data
  callback(getDemoAppointments())
  
  // Return unsubscribe function
  return () => {
    const index = demoListeners.indexOf(callback)
    if (index !== -1) {
      demoListeners.splice(index, 1)
    }
  }
}

function notifyDemoListeners() {
  demoListeners.forEach(callback => callback([...demoAppointments]))
}


