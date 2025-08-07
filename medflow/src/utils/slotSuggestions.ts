// AI Integration Point: Replace logic with AI scheduling later
export function getNextAvailableSlots(): { label: string; date: Date }[] {
  const now = new Date()
  const base = new Date(now)
  base.setHours(base.getHours() + 1, 0, 0, 0)

  // Return three simple future slots; replace with AI ranking later
  return [0,1,2].map((i) => {
    const d = new Date(base)
    d.setHours(base.getHours() + i * 2)
    const label = d.toLocaleString('ro-RO', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    return { label, date: d }
  })
}