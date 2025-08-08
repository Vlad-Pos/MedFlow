import { useCallback, useState } from 'react'

type DropzoneProps = {
  accept?: string
  multiple?: boolean
  onFiles: (files: File[]) => void
}

export default function Dropzone({ accept = 'application/pdf,image/jpeg', multiple = true, onFiles }: DropzoneProps) {
  const [isOver, setIsOver] = useState(false)

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }, [])
  const onDragLeave = useCallback(() => setIsOver(false), [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    const filtered = files.filter(f => accept.split(',').includes(f.type))
    onFiles(filtered)
  }, [accept, onFiles])

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    onFiles(files)
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      aria-label="Zona de încărcare"
      tabIndex={0}
      className={`rounded-2xl border border-dashed px-4 py-6 text-center text-sm outline-none transition ${isOver ? 'border-[var(--medflow-primary)] bg-white/10' : 'border-white/15 bg-white/5'}`}
    >
      <div className="mb-2 text-gray-200">Trageți aici fișierele sau</div>
      <label className="btn-ghost inline-block cursor-pointer">
        <input className="sr-only" type="file" accept={accept} multiple={multiple} onChange={onPick} />
        alegeți fișiere
      </label>
    </div>
  )
}