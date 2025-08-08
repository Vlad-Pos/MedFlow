import { useEffect, useState, useMemo } from 'react'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../providers/AuthProvider'
import AppointmentForm from '../components/AppointmentForm'
import DocumentUpload from '../components/DocumentUpload'
import { useLocation } from 'react-router-dom'
import { isDemoMode } from '../utils/env'

interface DocMeta { id: string; fileUrl: string; fileName: string; contentType: string; createdAt?: any }

type StatusKey = 'all' | 'scheduled' | 'completed' | 'no_show'

export default function Appointments() {
  const { user } = useAuth()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [creatingAt, setCreatingAt] = useState<string | undefined>(undefined)
  const [appointments, setAppointments] = useState<any[]>([])
  const [docs, setDocs] = useState<Record<string, DocMeta[]>>({})
  const location = useLocation()

  const [statusFilter, setStatusFilter] = useState<StatusKey>('all')
  const [search, setSearch] = useState('')

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

  const visibleAppointments = useMemo(() => {
    const term = search.trim().toLowerCase()
    return appointments.filter(a => {
      const statusOk = statusFilter === 'all' ? true : a.status === statusFilter
      const searchOk = !term || String(a.patientName || '').toLowerCase().includes(term)
      return statusOk && searchOk
    })
  }, [appointments, statusFilter, search])

  function statusPill(s: string) {
    const map: Record<string, string> = {
      scheduled: 'bg-[var(--medflow-primary)] text-white',
      completed: 'bg-emerald-600 text-white',
      no_show: 'bg-red-600 text-white',
    }
    return <span className={`rounded-full px-2 py-0.5 text-xs ${map[s] || 'bg-white/10 text-gray-100'}`}>{s === 'scheduled' ? 'Programat' : s === 'completed' ? 'Finalizat' : 'Nu s-a prezentat'}</span>
  }

  async function handleDelete(id: string) {
    if (!confirm('Ștergeți programarea?')) return
    await deleteDoc(doc(db, 'appointments', id))
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Programări</h2>
          <div className="flex items-center gap-2">
            {isDemoMode() && <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-200">Mod demo - date de exemplu</span>}
            <button className="btn-primary" onClick={() => { setSelectedId(undefined); setCreatingAt(undefined) }}>Nouă</button>
          </div>
        </div>

        {/* Toolbar filters */}
        <div className="flex flex-wrap items-center gap-2">
          {([
            ['all','Toate'],
            ['scheduled','Programate'],
            ['completed','Finalizate'],
            ['no_show','Nu s-a prezentat']
          ] as Array<[StatusKey,string]>).map(([key,label]) => (
            <button key={key} className={`btn-ghost ${statusFilter===key ? 'ring-2 ring-[var(--medflow-primary)]' : ''}`} onClick={()=>setStatusFilter(key)}>{label}</button>
          ))}
          <div className="ml-auto" />
          <input className="input w-56" placeholder="Caută pacient…" value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>

        <div className="card divide-y divide-white/10">
          {visibleAppointments.map(a => (
            <div key={a.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-medium">{a.patientName}</div>
                  {statusPill(a.status)}
                </div>
                <div className="text-sm text-gray-300">{new Date(a.dateTime?.toDate?.() || a.dateTime).toLocaleString('ro-RO')}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn-ghost" onClick={() => { setSelectedId(a.id); setCreatingAt(undefined) }}>Editează</button>
                <button className="btn-ghost" onClick={() => handleDelete(a.id)}>Șterge</button>
              </div>
            </div>
          ))}
          {visibleAppointments.length === 0 && (
            <div className="py-6 text-center text-sm text-gray-300">Nu există rezultate pentru filtrele curente.</div>
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
                    <div key={d.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-2 text-sm text-gray-100">
                      <a href={(d as any).fileURL || (d as any).fileUrl} target="_blank" className="hover:underline">{(d as any).fileName}</a>
                      <span className="text-xs text-gray-300">{new Date((d as any).uploadedAt?.toDate?.() || (d as any).createdAt || Date.now()).toLocaleString('ro-RO')}</span>
                    </div>
                  ))}
                  {(docs[selectedId]?.length || 0) === 0 && <div className="text-sm text-gray-300">Nu există documente încărcate.</div>}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-300">Salvați mai întâi programarea pentru a încărca documente.</div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}