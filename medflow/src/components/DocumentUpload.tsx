import { useState } from 'react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage, db } from '../services/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import LoadingSpinner from './LoadingSpinner'
import { useAuth } from '../providers/AuthProvider'

export default function DocumentUpload({ appointmentId }: { appointmentId: string }) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/pjpeg'].includes(file.type)) {
      setError('Doar PDF sau JPEG sunt permise.')
      return
    }
    setError(null)
    setSuccess(null)

    const path = `appointments/${appointmentId}/${Date.now()}_${file.name}`
    const storageRef = ref(storage, path)
    const task = uploadBytesResumable(storageRef, file)

    task.on('state_changed', (snap) => {
      const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
      setProgress(pct)
    }, (_err) => {
      setError('Încărcarea a eșuat.')
      setProgress(null)
    }, async () => {
      const url = await getDownloadURL(task.snapshot.ref)
      await addDoc(collection(db, 'documents'), {
        appointmentId,
        uploaderId: user.uid,
        fileUrl: url,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        createdAt: serverTimestamp(),
      })
      setSuccess('Document încărcat cu succes!')
      setProgress(null)
    })
  }

  return (
    <div className="space-y-2">
      <label className="label">Încărcați document (PDF/JPEG)</label>
      <input type="file" accept="application/pdf,image/jpeg" onChange={handleFileChange} />
      {progress !== null && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"><LoadingSpinner /> {progress}%</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {success && <div className="text-sm text-emerald-600">{success}</div>}
    </div>
  )
}