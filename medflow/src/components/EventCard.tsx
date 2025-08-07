export default function EventCard({ title, status, time }: { title: string; status: 'scheduled'|'completed'|'no_show'; time?: string }) {
  const statusMap: Record<string, { label: string; bg: string; text: string }> = {
    scheduled: { label: 'Programat', bg: 'bg-[rgba(158,133,176,0.18)]', text: 'text-[var(--medflow-primary)]' },
    completed: { label: 'Finalizat', bg: 'bg-[rgba(16,185,129,0.18)]', text: 'text-emerald-300' },
    no_show: { label: 'Nu s-a prezentat', bg: 'bg-[rgba(239,68,68,0.18)]', text: 'text-red-300' },
  }
  const s = statusMap[status]
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-2 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="truncate text-sm font-medium text-gray-100">{title}</div>
        <span className={`ml-2 inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs ${s.bg} ${s.text}`}>{s.label}</span>
      </div>
      {time && <div className="mt-1 text-[11px] text-gray-200/80">{time}</div>}
    </div>
  )
}