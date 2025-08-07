import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import AppointmentForm from '../components/AppointmentForm'
import DocumentUpload from '../components/DocumentUpload'
import { Link, useLocation } from 'react-router-dom'

interface DocMeta { id: string; fileUrl: string; fileName: string; contentType: string; createdAt?: any }

export default function Appointments() {
  const { user } = useAuth()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [creatingAt, setCreatingAt] = useState<string | undefined>(undefined)
  const [appointments, setAppointments] = useState<any[]>([])
  const [docs, setDocs] = useState<Record<string, DocMeta[]>>({})
  const location = useLocation()

  // Initialize edit/new from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const edit = params.get('edit') || undefined
    const newAt = params.get('new') || undefined
    setSelectedId(edit)
    setCreatingAt(newAt || undefined)
  }, [location.search])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', user.uid),
      orderBy('dateTime', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setAppointments(rows)
    })
    return () => unsub()
  }, [user])

  // Listen for docs per appointment
  useEffect(() => {
    const unsubs: (() => void)[] = []
    for (const appt of appointments) {
      const q = query(collection(db, 'documents'), where('appointmentId', '==', appt.id), orderBy('createdAt', 'desc'))
      const unsub = onSnapshot(q, (snap) => {
        const d = snap.docs.map(dd => ({ id: dd.id, ...(dd.data() as any) }))
        setDocs(prev => ({ ...prev, [appt.id]: d }))
      })
      unsubs.push(unsub)
    }
    return () => { unsubs.forEach(u => u()) }
  }, [appointments])

  async function handleDelete(id: string) {
    if (!confirm('Ștergeți programarea?')) return
    await deleteDoc(doc(db, 'appointments', id))
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Programări</h2>
          <button className="btn-primary" onClick={() => { setSelectedId(undefined); setCreatingAt(undefined) }}>Nouă</button>
        </div>
        <div className="card divide-y divide-gray-100 dark:divide-gray-800">
          {appointments.map(a => (
            <div key={a.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="font-medium">{a.patientName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{new Date(a.dateTime?.toDate?.() || a.dateTime).toLocaleString('ro-RO')} • {a.status === 'scheduled' ? 'Programat' : a.status === 'completed' ? 'Finalizat' : 'Nu s-a prezentat'}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => { setSelectedId(a.id); setCreatingAt(undefined) }}>Editează</button>
                <button className="btn-ghost" onClick={() => handleDelete(a.id)}>Șterge</button>
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-600 dark:text-gray-300">Nu există programări încă. <Link className="link" to="/dashboard">Deschide calendarul</Link></div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">{selectedId ? 'Editează programare' : 'Creează programare'}</h3>
          <AppointmentForm appointmentId={selectedId} onSaved={() => { setSelectedId(undefined); setCreatingAt(undefined) }} />
        </div>

        {(selectedId || creatingAt) && (
          <div className="card">
            <h4 className="mb-3 font-medium">Documente</h4>
            {selectedId ? (
              <>
                <DocumentUpload appointmentId={selectedId} />
                <div className="mt-3 space-y-2">
                  {(docs[selectedId] || []).map(d => (
                    <div key={d.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-2 text-sm text-gray-100">
                      <a href={(d as any).fileURL || (d as any).fileUrl} target="_blank" className="hover:underline">{(d as any).fileName}</a>
                      <span className="text-xs text-gray-300">{new Date((d as any).uploadedAt?.toDate?.() || (d as any).createdAt || Date.now()).toLocaleString('ro-RO')}</span>
                    </div>
                  ))}
                  {(docs[selectedId]?.length || 0) === 0 && <div className="text-sm text-gray-500">Nu există documente încărcate.</div>}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Salvați mai întâi programarea pentru a încărca documente.</div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}