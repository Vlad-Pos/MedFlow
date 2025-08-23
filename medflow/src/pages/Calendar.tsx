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

import React, { Suspense, useState } from 'react'
import { SchedulingCalendar } from '../components/modules/calendar'
import LoadingSpinner from '../components/LoadingSpinner'
import { ErrorBoundary } from '../components/ErrorBoundary'

/**
 * Calendar Page Component
 * 
 * This page provides access to the enhanced scheduling calendar system
 * while maintaining complete separation from existing calendar functionality.
 */
export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000000] via-[#100B1A] to-[#25153A]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Calendar
          </h1>
          <p className="text-[#CCCCCC] text-lg">
            Manage your schedule with our enhanced calendar system
          </p>
        </div>
        
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading calendar..." />}>
            <SchedulingCalendar />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  )
}
