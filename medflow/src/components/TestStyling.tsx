import React from "react";

export default function TestStyling() {
  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Test Styling Components</h1>
        
        <div className="rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Color Palette Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#243153] rounded-lg mx-auto mb-2"></div>
              <p className="text-sm">Primary Blue</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#494E62] rounded-lg mx-auto mb-2"></div>
              <p className="text-sm">Secondary Blue</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#847697] rounded-lg mx-auto mb-2"></div>
              <p className="text-sm">Accent Purple</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-[#E5E7EB] rounded-lg mx-auto mb-2"></div>
              <p className="text-sm">Light Gray</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Typography Test</h2>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Heading 1 - Large Title</h1>
            <h2 className="text-3xl font-semibold">Heading 2 - Section Title</h2>
            <h3 className="text-2xl font-medium">Heading 3 - Subsection</h3>
            <p className="text-lg">Body text with good readability and proper line height.</p>
            <p className="text-base">Standard body text for regular content.</p>
            <p className="text-sm text-gray-300">Small text for captions and metadata.</p>
          </div>
        </div>

        <div className="rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Button Styles</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-[#243153] text-white rounded-lg hover:bg-[#494E62] transition-colors">
              Primary Button
            </button>
            <button className="px-6 py-3 bg-[#847697] text-white rounded-lg hover:bg-[#6B5B7A] transition-colors">
              Secondary Button
            </button>
            <button className="px-6 py-3 border border-[#243153] text-[#243153] rounded-lg hover:bg-[#243153] hover:text-white transition-colors">
              Outline Button
            </button>
            <button className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Disabled Button
            </button>
          </div>
        </div>

        <div className="rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Form Elements</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">Input Label</label>
              <input 
                type="text" 
                placeholder="Enter text here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243153] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Select Dropdown</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243153] focus:border-transparent">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Textarea</label>
              <textarea 
                rows={4}
                placeholder="Enter longer text here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243153] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Card Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Card Title</h3>
              <p className="text-gray-600 mb-4">This is a sample card component with some content.</p>
              <button className="px-4 py-2 bg-[#243153] text-white rounded hover:bg-[#494E62] transition-colors">
                Action
              </button>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Another Card</h3>
              <p className="text-gray-600 mb-4">Cards can contain various types of content and actions.</p>
              <button className="px-4 py-2 bg-[#847697] text-white rounded hover:bg-[#6B5B7A] transition-colors">
                Learn More
              </button>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Info Card</h3>
              <p className="text-gray-600 mb-4">Useful for displaying information in an organized way.</p>
              <button className="px-4 py-2 border border-[#243153] text-[#243153] rounded hover:bg-[#243153] hover:text-white transition-colors">
                Details
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Spacing & Layout</h2>
          <div className="space-y-4">
            <div className="p-2 bg-gray-200 rounded">Padding 2</div>
            <div className="p-4 bg-gray-300 rounded">Padding 4</div>
            <div className="p-6 bg-gray-400 rounded">Padding 6</div>
            <div className="p-8 bg-gray-500 rounded">Padding 8</div>
          </div>
        </div>
      </div>
    </div>
  )
}



