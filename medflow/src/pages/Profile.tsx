import { useAuth } from '../providers/AuthProvider'

export default function Profile() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <section className="mx-auto max-w-lg">
      <h2 className="mb-4 text-2xl font-semibold">Profil</h2>
      <div className="card space-y-2">
        <div><span className="font-medium">Nume:</span> {user.displayName || '—'}</div>
        <div><span className="font-medium">Email:</span> {user.email}</div>
        <div><span className="font-medium">Rol:</span> {user.role === 'nurse' ? 'Asistent' : 'Doctor'}</div>
        <div className="text-sm text-gray-500">Datele de profil pot fi extinse ulterior (clinică, specializare etc.).</div>
      </div>
    </section>
  )
}