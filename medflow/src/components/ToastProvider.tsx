import { createContext, useContext, useMemo, useState } from 'react'

export type Toast = { id: number; message: string; type?: 'success' | 'error' | 'info' }

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function showToast(message: string, type: Toast['type'] = 'info') {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter(t => t.id !== id)), 3500)
  }

  const value = useMemo(() => ({ showToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-2 z-[9999] mx-auto flex w-full max-w-md flex-col gap-2 px-2">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto rounded-xl border p-3 shadow-md backdrop-blur ${t.type === 'success' ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-100' : t.type === 'error' ? 'border-red-400/30 bg-red-400/15 text-red-100' : 'border-white/10 bg-white/10 text-gray-100'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}