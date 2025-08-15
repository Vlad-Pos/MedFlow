import React from 'react'

/**
 * Environment Test Component
 * 
 * This component helps debug environment variable loading
 */
export function EnvironmentTest() {
  const demoMode = import.meta.env.VITE_DEMO_MODE
  const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const nodeEnv = import.meta.env.MODE

  return (
    <div className="fixed bottom-4 right-4 bg-purple-800 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">Environment Test</div>
      <div>Mode: {nodeEnv}</div>
      <div>Demo Mode: {demoMode}</div>
      <div>Firebase API Key: {firebaseApiKey ? '✅ Set' : '❌ Not Set'}</div>
      <div>API Key Length: {firebaseApiKey?.length || 0}</div>
      <div>Demo Mode Type: {typeof demoMode}</div>
      <div>Demo Mode Truthy: {demoMode ? 'Yes' : 'No'}</div>
    </div>
  )
}

export default EnvironmentTest
