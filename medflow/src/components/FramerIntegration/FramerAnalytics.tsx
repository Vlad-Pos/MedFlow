import React, { useState, useEffect } from 'react';
import { useFramerIntegration } from '../../hooks/useFramerIntegration';
import { useAuth } from '../../providers/AuthProvider';
import { motion } from 'framer-motion';
import { BarChart3, Users, MousePointer, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { formatTimestamp } from '../../utils/timeUtils';

export const FramerAnalytics: React.FC = () => {
  const { userContext, isFromFramer } = useFramerIntegration();
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = () => {
    try {
      // Load from session storage
      const navigation = sessionStorage.getItem('framerNavigation');
      const userContext = sessionStorage.getItem('framerUserContext');
      const customEvents = sessionStorage.getItem('medflowCustomEvents');

      setAnalyticsData({
        navigation: navigation ? JSON.parse(navigation) : null,
        userContext: userContext ? JSON.parse(userContext) : null,
        customEvents: customEvents ? JSON.parse(customEvents) : [],
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const clearAnalyticsData = () => {
    sessionStorage.removeItem('framerNavigation');
    sessionStorage.removeItem('framerUserContext');
    sessionStorage.removeItem('medflowCustomEvents');
    loadAnalyticsData();
  };



  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  // Only show for admin users AND when there's Framer data
  const isAdmin = user?.email === 'your-admin-email@domain.com'; // Replace with your email
  
  if (!user || !isAdmin || (!isFromFramer() && !analyticsData.navigation)) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Framer Analytics</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadAnalyticsData}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-900">
                {isFromFramer() ? 'Framer User' : 'App User'}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <MousePointer className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-green-900">
                {analyticsData.navigation ? 'Navigated' : 'Direct'}
              </div>
            </div>
          </div>

          {/* Navigation Info */}
          {analyticsData.navigation && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Navigation</span>
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Source:</span>
                  <span className="font-medium">{analyticsData.navigation.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{getTimeAgo(analyticsData.navigation.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Welcome:</span>
                  <span className="font-medium">{analyticsData.navigation.showWelcome ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}

          {/* User Context */}
          {analyticsData.userContext && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">User Context</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Referrer:</span>
                  <span className="font-medium truncate max-w-32">
                    {analyticsData.userContext.referrer ? 'Framer Site' : 'Direct'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{analyticsData.userContext.language || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{getTimeAgo(analyticsData.userContext.timestamp)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Expanded View */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3 border-t border-gray-100"
            >
              <h4 className="font-medium text-gray-900">Raw Data</h4>
              <div className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-40">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(analyticsData, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2 border-t border-gray-100">
            <button
              onClick={clearAnalyticsData}
              className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              Clear Data
            </button>
            <button
              onClick={() => console.log('Analytics Data:', analyticsData)}
              className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Log to Console
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
