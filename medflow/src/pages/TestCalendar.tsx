import React, { Suspense } from 'react'
import { SchedulingCalendar } from '../components/modules/calendar'
import { LoadingSpinner } from '../components/ui/feedback/LoadingSpinner'
import { ErrorBoundary } from '../components/ui/feedback/ErrorBoundary'

export default function TestCalendarPage() {
  return (
    <div 
      className="fixed inset-0 w-screen h-screen m-0 p-0 overflow-hidden"
      style={{
        top: '83px' // Adjusted navbar height: py-4 (32px) + logo h-11 (44px) + 7px buffer = 83px
      }}
    >
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading calendar..." />}>
          <div className="w-full h-full">
            <SchedulingCalendar />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
