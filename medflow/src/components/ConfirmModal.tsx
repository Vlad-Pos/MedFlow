export default function ConfirmModal({ open, title, message, confirmText = 'Confirmă', cancelText = 'Anulează', onConfirm, onCancel }: {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#3f455a] p-4 shadow-lg">
        <h4 className="text-lg font-semibold text-gray-100">{title}</h4>
        <p className="mt-2 text-sm text-gray-200/90">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-ghost" onClick={onCancel}>{cancelText}</button>
          <button className="btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}