import React, { useState } from 'react';
import { DesignWorkWrapper } from '../components/DesignGuidance';

export default function DesignGuidanceTest() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Design Guidance Test Page</h1>
        
        <div className="rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Component Testing</h2>
          <p className="text-gray-300 mb-6">This page is for testing design guidance components and ensuring consistency.</p>
        </div>

        <div className="rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Color Scheme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--medflow-brand-1)] rounded-lg mx-auto mb-2"></div>
              <p className="text-sm text-gray-300">Brand 1</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--medflow-brand-2)] rounded-lg mx-auto mb-2"></div>
              <p className="text-sm text-gray-300">Brand 2</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--medflow-brand-3)] rounded-lg mx-auto mb-2"></div>
              <p className="text-sm text-gray-300">Brand 3</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[var(--medflow-brand-4)] rounded-lg mx-auto mb-2"></div>
              <p className="text-sm text-gray-300">Brand 4</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg p-4">
          <h2 className="text-xl font-semibold text-white mb-4">Typography</h2>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">Heading 1</h1>
            <h2 className="text-3xl font-semibold text-white">Heading 2</h2>
            <h3 className="text-2xl font-medium text-white">Heading 3</h3>
            <p className="text-lg text-gray-300">Body text with good readability</p>
            <p className="text-sm text-gray-400">Smaller text for captions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
