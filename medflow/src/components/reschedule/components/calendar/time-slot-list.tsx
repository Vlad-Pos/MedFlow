import { motion } from "framer-motion"
import type { TimeSlot } from "../../types/calendar"

interface TimeSlotListProps {
  timeSlots: TimeSlot[]
  selectedSlot: string
  onSlotSelect: (slotId: string) => void
}

export default function TimeSlotList({ timeSlots, selectedSlot, onSlotSelect }: TimeSlotListProps) {
  return (
    <div className="flex-1 min-h-0 border border-[var(--medflow-border)] dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="p-3 space-y-2">
          {timeSlots.map((slot) => (
            <motion.button
              key={slot.id}
              type="button"
              onClick={() => onSlotSelect(slot.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`w-full p-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                selectedSlot === slot.id
                  ? "bg-[var(--medflow-brand-1)] border-[var(--medflow-brand-1)] text-white"
                  : "border-[var(--medflow-border)] dark:border-gray-600 text-[var(--medflow-text-primary)] dark:text-white hover:border-[var(--medflow-brand-1)] hover:bg-[var(--medflow-surface-elevated)] dark:hover:bg-[var(--medflow-surface-dark)]"
              }`}
            >
              {slot.time}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
