import React from "react";

export default function TestStyling() {
  return (
    <div className="min-h-screen bg-[#243153] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-semibold mb-6 leading-snug text-white">
          UI Polish Test Component
        </h1>
        
        <p className="text-lg mb-4 leading-relaxed text-gray-300">
          This component tests our new standardized typography and spacing.
        </p>
        
        <div className="px-6 py-12 max-w-5xl mx-auto">
          <h2 className="text-4xl font-semibold mb-6 leading-snug text-white">
            Typography Test
          </h2>
          
          <p className="text-lg mb-4 leading-relaxed text-gray-300">
            All headings should use text-4xl font-semibold mb-6 leading-snug text-white
          </p>
          
          <p className="text-lg mb-4 leading-relaxed text-gray-300">
            All paragraphs should use text-lg mb-4 leading-relaxed text-gray-300
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-[#243153] via-[#494E62] to-[#847697] p-12 rounded-lg shadow-lg mb-8">
          <h3 className="text-xl font-semibold mb-2 text-white">
            Gradient Background Test
          </h3>
          <p className="text-gray-300">
            This section should have a gradient background with the brand colors.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="flex-1 bg-[#494E62] p-6 rounded-lg shadow-lg mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-2 text-white">Responsive Layout</h4>
            <p className="text-gray-300">This should stack on mobile and be side-by-side on desktop.</p>
          </div>
          <div className="flex-1 bg-[#494E62] p-6 rounded-lg shadow-lg">
            <h4 className="text-lg font-semibold mb-2 text-white">Responsive Layout</h4>
            <p className="text-gray-300">This should stack on mobile and be side-by-side on desktop.</p>
          </div>
        </div>
        
        <button className="
          px-6 py-3 rounded-lg
          bg-purple-700 text-white font-semibold
          hover:bg-purple-800
          focus:outline-none focus:ring-4 focus:ring-purple-500
          transition duration-300 ease-in-out
          transform hover:scale-105
          mt-8
        ">
          Test Button with New Styles
        </button>
      </div>
    </div>
  );
}


