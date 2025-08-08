import { useEffect, useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage, db } from '../services/firebase'
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore'
import { useAuth } from '../providers/AuthProvider'
import ConfirmModal from './ConfirmModal'
import { useToast } from './ToastProvider'
import Dropzone from './Dropzone'

interface DocMeta { id: string; fileName: string; fileType: string; fileURL: string; uploadedBy: string; uploadedAt?: any; storagePath?: string }

export default function DocumentUpload({ appointmentId }: { appointmentId: string }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [docs, setDocs] = useState<DocMeta[]>([])
  const [toDelete, setToDelete] = useState<DocMeta | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'documents'), where('appointmentId', '==', appointmentId), orderBy('uploadedAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const d = snap.docs.map(dd => ({ id: dd.id, ...(dd.data() as any) })) as DocMeta[]
      setDocs(d)
    })
    return () => unsub()
  }, [appointmentId])

  async function handleDelete(meta: DocMeta) {
    try {
      await deleteDoc(doc(db, 'documents', meta.id))
      if (meta.storagePath) {
        await deleteObject(ref(storage, meta.storagePath))
      }
      showToast('Document șters.', 'success')
    } catch {
      showToast('Ștergerea a eșuat.', 'error')
    } finally {
      setToDelete(null)
    }
  }

  async function uploadSingleFile(file: File) {
    const allowed = ['application/pdf', 'image/jpeg']
    if (!allowed.includes(file.type)) { setError('Doar PDF sau JPEG.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Maxim 10MB.'); return }

    setError(null)
    const path = `appointments/${appointmentId}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)

    await new Promise<void>((resolve, reject) => {
      task.on('state_changed', (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        setProgress(pct)
      }, () => {
        setError('Încărcarea a eșuat.')
        setProgress(null)
        reject(new Error('upload_failed'))
      }, async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        await addDoc(collection(db, 'documents'), {
          appointmentId,
          fileName: file.name,
          fileType: file.type === 'application/pdf' ? 'pdf' : 'jpeg',
          fileURL: url,
          uploadedBy: user!.uid,
          uploadedAt: serverTimestamp(),
          storagePath: path,
        })
        resolve()
      })
    })
  }

  async function onFiles(files: File[]) {
    for (const f of files) {
      try {
        await uploadSingleFile(f)
        showToast('Document încărcat cu succes!', 'success')
      } catch {}
      finally { setProgress(null) }
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="label">Încărcați documente (PDF/JPEG)</label>
        <Dropzone onFiles={onFiles} />
        {progress !== null && (
          <div className="mt-2 flex w-56 items-center gap-2">
            <div className="h-2 w-full overflow-hidden rounded bg-white/10">
              <div className="h-full bg-[var(--medflow-primary)]" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-200/90">{progress}%</span>
          </div>
        )}
        {error && <div className="mt-2 text-sm text-red-300">{error}</div>}
      </div>

      <div className="space-y-2" aria-live="polite">
        {docs.map(d => (
          <div key={d.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-2 text-sm text-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              {d.fileType === 'jpeg' && <img src={d.fileURL} alt={d.fileName} className="h-10 w-10 rounded object-cover" />}
              <a href={d.fileURL} target="_blank" className="hover:underline">{d.fileName}</a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300">{d.uploadedAt?.toDate?.() ? new Date(d.uploadedAt.toDate()).toLocaleString('ro-RO') : ''}</span>
              <button className="btn-ghost" onClick={() => setToDelete(d)}>Șterge</button>
            </div>
          </div>
        ))}
        {docs.length === 0 && <div className="text-sm text-gray-300">Nu există documente încărcate.</div>}
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Șterge documentul?"
        message="Această acțiune este permanentă. Continuați?"
        confirmText="Șterge"
        cancelText="Anulează"
        onConfirm={() => toDelete && handleDelete(toDelete)}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}