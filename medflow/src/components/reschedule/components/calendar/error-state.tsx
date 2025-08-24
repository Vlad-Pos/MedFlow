import { motion } from "framer-motion"

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
      >
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.div>
      <h3 className="text-lg font-semibold text-[var(--medflow-text-primary)] dark:text-white mb-3">Something went wrong</h3>
      <p className="text-sm text-[var(--medflow-text-secondary)] dark:text-gray-300 mb-4 leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 bg-[var(--medflow-brand-1)] text-white rounded-lg hover:bg-[var(--medflow-brand-2)] transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
