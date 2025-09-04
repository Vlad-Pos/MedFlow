/**
 * 🏥 MedFlow - Calendar Page Component
 * 
 * 💡 AI Agent Guidance:
 * This component integrates the existing calendar module with MedFlow's
 * brand identity and navigation system.
 * 
 * Before modifying this component, please review:
 * - MedFlow/BRAND_IDENTITY.md (brand guidelines and colors)
 * - MedFlow/DEVELOPMENT_GUIDE.md (technical standards)
 * - MedFlow/FEATURES_DOCUMENTATION.md (feature implementation)
 */

import React, { Suspense } from 'react'
import { SchedulingCalendar } from '../components/modules/calendar'
import { LoadingSpinner } from '../components/ui/feedback/LoadingSpinner'
import { ErrorBoundary } from '../components/ui/feedback/ErrorBoundary'

/**
 * Calendar Page Component
 * 
 * This page provides access to the enhanced scheduling calendar system
 * with full-screen immersive experience matching the working test calendar.
 */
export default function CalendarPage() {
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
