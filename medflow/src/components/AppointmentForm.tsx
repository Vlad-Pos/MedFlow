import { useEffect, useState } from 'react'
import { Timestamp, addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'

export type AppointmentStatus = 'scheduled' | 'completed' | 'no_show'

export interface Appointment {
  id?: string
  doctorId: string
  patientName: string
  dateTime: Date
  symptoms: string
  notes?: string
  status: AppointmentStatus
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export default function AppointmentForm({ appointmentId, onSaved }: { appointmentId?: string, onSaved?: () => void }) {
  const { user } = useAuth()
  const [patientName, setPatientName] = useState('')
  const [dateTime, setDateTime] = useState<string>('')
  const [symptoms, setSymptoms] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('scheduled')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!appointmentId) return
      const ref = doc(db, 'appointments', appointmentId)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data() as any
        setPatientName(data.patientName || '')
        setDateTime(new Date(data.dateTime?.toDate?.() || data.dateTime).toISOString().slice(0, 16))
        setSymptoms(data.symptoms || '')
        setNotes(data.notes || '')
        setStatus((data.status as AppointmentStatus) || 'scheduled')
      }
    }
    load()
  }, [appointmentId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!user) { setError('Autentificare necesară'); return }
    if (!patientName.trim()) { setError('Introduceți numele pacientului'); return }
    if (!dateTime) { setError('Selectați data și ora'); return }
    if (!symptoms.trim()) { setError('Completați simptomele'); return }

    try {
      const payload: any = {
        doctorId: user.uid,
        patientName: patientName.trim(),
        dateTime: new Date(dateTime),
        symptoms: symptoms.trim(),
        notes: notes.trim() || '',
        status,
        updatedAt: serverTimestamp(),
      }
      if (!appointmentId) {
        payload.createdAt = serverTimestamp()
        await addDoc(collection(db, 'appointments'), payload)
      } else {
        const ref = doc(db, 'appointments', appointmentId)
        await updateDoc(ref, payload)
      }
      onSaved?.()
    } catch (err) {
      setError('Salvarea programării a eșuat. Încercați din nou.')
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20">{error}</div>}
      <div>
        <label className="label">Nume pacient</label>
        <input className="input" value={patientName} onChange={e => setPatientName(e.target.value)} required />
      </div>
      <div>
        <label className="label">Data și ora</label>
        <input className="input" type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} required />
      </div>
      <div>
        <label className="label">Simptome</label>
        <textarea className="textarea" rows={4} value={symptoms} onChange={e => setSymptoms(e.target.value)} required />
      </div>
      <div>
        <label className="label">Note (opțional)</label>
        <textarea className="textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <div>
        <label className="label">Status</label>
        <select className="input" value={status} onChange={e => setStatus(e.target.value as AppointmentStatus)}>
          <option value="scheduled">Programat</option>
          <option value="completed">Finalizat</option>
          <option value="no_show">Nu s-a prezentat</option>
        </select>
      </div>
      <button className="btn-secondary">Salvează</button>
    </form>
  )
}