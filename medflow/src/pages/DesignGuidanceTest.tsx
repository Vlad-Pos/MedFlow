import React, { useState } from 'react';
import { DesignWorkWrapper } from '../components/DesignGuidance';

const DesignGuidanceTest: React.FC = () => {
  const [showWrappedComponent, setShowWrappedComponent] = useState(false);
  const [showAnotherWrapped, setShowAnotherWrapped] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Design Guidance System Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test 1: Component without wrapper */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test 1: Normal Component (No Wrapper)
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This component has no DesignWorkWrapper and should render normally without any guidance overlay.
            </p>
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-700 dark:text-green-300 text-sm">
                ✅ This component renders normally without any design guidance interference.
              </p>
            </div>
          </div>

          {/* Test 2: Component with wrapper */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test 2: Wrapped Component
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This component is wrapped with DesignWorkWrapper and should show a guidance overlay in development.
            </p>
            <DesignWorkWrapper componentName="TestWrappedComponent">
              <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  🔵 This component is wrapped with DesignWorkWrapper. You should see a blue guidance overlay in the bottom-right corner.
                </p>
              </div>
            </DesignWorkWrapper>
          </div>

          {/* Test 3: Conditional wrapper */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test 3: Conditional Wrapper
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This component conditionally shows the wrapper based on state.
            </p>
            <button
              onClick={() => setShowWrappedComponent(!showWrappedComponent)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg mb-4 transition-colors"
            >
              {showWrappedComponent ? 'Remove Wrapper' : 'Add Wrapper'}
            </button>
            
            {showWrappedComponent ? (
              <DesignWorkWrapper componentName="ConditionalTestComponent">
                <div className="bg-purple-100 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    🟣 This component now has a wrapper. You should see the guidance overlay.
                  </p>
                </div>
              </DesignWorkWrapper>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  ⚪ No wrapper - component renders normally.
                </p>
              </div>
            )}
          </div>

          {/* Test 4: Multiple wrapped components */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test 4: Multiple Wrapped Components
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Testing multiple components with wrappers to ensure proper behavior.
            </p>
            <button
              onClick={() => setShowAnotherWrapped(!showAnotherWrapped)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg mb-4 transition-colors"
            >
              {showAnotherWrapped ? 'Hide' : 'Show'} Another Wrapped Component
            </button>
            
            <DesignWorkWrapper componentName="FirstTestComponent">
              <div className="bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-3">
                <p className="text-orange-700 dark:text-orange-300 text-sm">
                  🟠 First wrapped component
                </p>
              </div>
            </DesignWorkWrapper>
            
            {showAnotherWrapped && (
              <DesignWorkWrapper componentName="SecondTestComponent">
                <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    🔴 Second wrapped component
                  </p>
                </div>
              </DesignWorkWrapper>
            )}
          </div>
        </div>

        {/* Environment Information */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Environment Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">NODE_ENV:</p>
              <p className="font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                {process.env.NODE_ENV || 'undefined'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Guidance System Status:</p>
              <p className={`font-mono text-sm p-2 rounded ${
                process.env.NODE_ENV === 'development' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {process.env.NODE_ENV === 'development' ? 'ACTIVE' : 'DISABLED'}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
            Testing Instructions
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
            <li>In development mode, you should see blue guidance overlays for wrapped components</li>
            <li>Click "Review Requirements" to see the 4-step compliance process</li>
            <li>Complete the compliance process to mark components as reviewed</li>
            <li>Components marked as reviewed should no longer show guidance</li>
            <li>In production mode, no guidance should appear at all</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DesignGuidanceTest;
