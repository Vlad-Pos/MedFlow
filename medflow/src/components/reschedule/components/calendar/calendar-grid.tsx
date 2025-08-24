import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getDaysInMonth, getFirstDayOfMonth, isToday, isSameDay, isPastDate } from "../../utils/calendar"

interface CalendarGridProps {
  currentMonth: Date
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  onMonthNavigate: (direction: "prev" | "next") => void
}

export default function CalendarGrid({ currentMonth, selectedDate, onDateSelect, onMonthNavigate }: CalendarGridProps) {
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-7 w-7" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isDisabled = isPastDate(date)
      const isSelected = isSameDay(date, selectedDate)
      const isTodayDate = isToday(date)

      days.push(
        <motion.button
          key={day}
          type="button"
          disabled={isDisabled}
          onClick={() => onDateSelect(date)}
          whileHover={!isDisabled ? { scale: 1.05 } : {}}
          whileTap={!isDisabled ? { scale: 0.95 } : {}}
          className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${
            isDisabled
              ? "text-gray-300 cursor-not-allowed"
              : isSelected
                ? "bg-[var(--medflow-brand-1)] text-white"
                : isTodayDate
                  ? "bg-[var(--medflow-brand-6)] text-[var(--medflow-brand-1)] border border-[var(--medflow-brand-1)]"
                  : "text-[var(--medflow-text-primary)] hover:bg-[var(--medflow-surface-elevated)] hover:text-[var(--medflow-brand-1)] dark:text-white dark:hover:bg-[var(--medflow-surface-dark)]"
          }`}
        >
          {day}
        </motion.button>,
      )
    }

    return days
  }

  return (
    <div className="flex-1 min-h-0 border border-[var(--medflow-border)] dark:border-gray-600 rounded-lg p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => onMonthNavigate("prev")}
          className="p-1 hover:bg-[var(--medflow-surface-elevated)] dark:hover:bg-[var(--medflow-surface-dark)] rounded-md transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h4 className="text-sm font-medium text-[var(--medflow-text-primary)] dark:text-white">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h4>
        <button
          type="button"
          onClick={() => onMonthNavigate("next")}
          className="p-1 hover:bg-[var(--medflow-surface-elevated)] dark:hover:bg-[var(--medflow-surface-dark)] rounded-md transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
          {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
            <div key={day} className="h-6 flex items-center justify-center text-xs font-medium text-[var(--medflow-text-tertiary)] dark:text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 flex-1 content-start">{renderCalendar()}</div>
      </div>
    </div>
  )
}
