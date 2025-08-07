export interface TimeSlot { start: Date; end: Date }
export interface ScheduleConstraints {
  workDays: number[] // 1=Mon ... 6=Sat, 0=Sun
  workStartHour: number // 8 => 08:00
  workEndHour: number // 17 => 17:00
  slotMinutes: number // 30
}

// TODO AI: Replace heuristic with AI/ML powered ranking using clinic-specific patterns and patient context
export function suggestSmartSlots(
  constraints: ScheduleConstraints,
  existingAppointments: TimeSlot[],
  fromDate: Date = new Date(),
  count = 3
): TimeSlot[] {
  const results: TimeSlot[] = []
  const slotMs = constraints.slotMinutes * 60 * 1000
  const occupied: [number, number][] = existingAppointments.map(s => [s.start.getTime(), s.end.getTime()])

  const cursor = new Date(fromDate)
  cursor.setMinutes(0, 0, 0)

  while (results.length < count) {
    const day = cursor.getDay()
    const isWorkDay = constraints.workDays.includes(day)
    const start = new Date(cursor)
    start.setHours(constraints.workStartHour, 0, 0, 0)
    const end = new Date(cursor)
    end.setHours(constraints.workEndHour, 0, 0, 0)

    if (isWorkDay) {
      for (let t = start.getTime(); t + slotMs <= end.getTime(); t += slotMs) {
        const slot: [number, number] = [t, t + slotMs]
        const overlaps = occupied.some(([s, e]) => !(slot[1] <= s || slot[0] >= e))
        if (!overlaps && t > Date.now()) {
          results.push({ start: new Date(t), end: new Date(t + slotMs) })
          if (results.length >= count) break
        }
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return results
}