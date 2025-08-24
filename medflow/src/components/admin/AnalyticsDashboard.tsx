import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  MousePointer, 
  TrendingUp, 
  Download, 
  RefreshCw,
  Eye,
  Clock,
  Target,
  Activity
} from 'lucide-react';
import { utmTracking } from '../../services/utmTracking';
import { featureAnalytics } from '../../services/featureAnalytics';
import { useFramerIntegration } from '../../hooks/useFramerIntegration';
import { formatTime, formatDuration } from '../../utils/dateUtils';

interface AnalyticsData {
  utmData: any[];
  featureData: any;
  conversionFunnel: any;
  userBehavior: any[];
  timestamp: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'utm' | 'features' | 'conversion' | 'users'>('overview');
  const { isFromFramer } = useFramerIntegration();

  useEffect(() => {
    loadAnalyticsData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = () => {
    setIsLoading(true);
    
    try {
      const data: AnalyticsData = {
        utmData: utmTracking.getAllTrackingData(),
        featureData: featureAnalytics.getAllAnalyticsData(),
        conversionFunnel: featureAnalytics.getConversionFunnel(),
        userBehavior: featureAnalytics.getUserBehavior(),
        timestamp: Date.now()
      };
      
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = () => {
    utmTracking.clearTrackingData();
    featureAnalytics.clearAnalyticsData();
    loadAnalyticsData();
  };

  const exportData = () => {
    if (!analyticsData) return;
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medflow-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };



  if (!analyticsData) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-[var(--medflow-text-primary)] mb-2">Analytics Dashboard</h2>
            <p className="text-[var(--medflow-text-secondary)]">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--medflow-text-primary)] mb-2">
                📊 Analytics Dashboard
              </h1>
              <p className="text-[var(--medflow-text-secondary)]">
                Comprehensive tracking and analytics for MedFlow app
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadAnalyticsData}
                disabled={isLoading}
                className="px-4 py-2 bg-[var(--medflow-brand-1)] text-[var(--medflow-text-primary)] rounded-lg hover:bg-[var(--medflow-brand-2)] disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportData}
                className="px-4 py-2 bg-[var(--medflow-brand-3)] text-[var(--medflow-text-primary)] rounded-lg hover:bg-[var(--medflow-brand-2)] flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear Data
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-[var(--medflow-text-tertiary)]">
            Last updated: {formatTime(analyticsData.timestamp)}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-[var(--medflow-surface-elevated)] rounded-lg p-1 shadow-sm border border-[var(--medflow-border)]">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'utm', label: 'UTM Tracking', icon: Target },
              { id: 'features', label: 'Feature Usage', icon: Activity },
              { id: 'conversion', label: 'Conversion Funnel', icon: TrendingUp },
              { id: 'users', label: 'User Behavior', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--medflow-brand-1)]/20 text-[var(--medflow-brand-1)]'
                    : 'text-[var(--medflow-text-tertiary)] hover:text-[var(--medflow-text-primary)] hover:bg-[var(--medflow-surface-dark)]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-[var(--medflow-surface-elevated)] rounded-xl shadow-lg p-6 border border-[var(--medflow-border)]">
          {activeTab === 'overview' && (
            <OverviewTab data={analyticsData} />
          )}
          
          {activeTab === 'utm' && (
            <UTMTab data={analyticsData.utmData} />
          )}
          
          {activeTab === 'features' && (
            <FeaturesTab data={analyticsData.featureData} />
          )}
          
          {activeTab === 'conversion' && (
            <ConversionTab data={analyticsData.conversionFunnel} />
          )}
          
          {activeTab === 'users' && (
            <UsersTab data={analyticsData.userBehavior} />
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const utmCount = data.utmData.length;
  const featureCount = data.featureData.rawEvents?.length || 0;
  const conversionRate = data.conversionFunnel.conversionRate || 0;
  const userCount = data.userBehavior.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--medflow-text-primary)]">Dashboard Overview</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="UTM Events"
          value={utmCount}
          icon={Target}
          color="blue"
          description="Marketing attribution events"
        />
        <MetricCard
          title="Feature Events"
          value={featureCount}
          icon={Activity}
          color="green"
          description="User interaction events"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="purple"
          description="Website to app conversion"
        />
        <MetricCard
          title="Active Users"
          value={userCount}
          icon={Users}
          color="orange"
          description="Users with activity"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--medflow-surface-light)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--medflow-text-primary)] mb-3">Recent Activity</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Last UTM event:</span>
              <span className="font-medium">
                {utmCount > 0 ? formatTime(data.utmData[utmCount - 1].timestamp) : 'None'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last feature event:</span>
              <span className="font-medium">
                {featureCount > 0 ? formatTime(data.featureData.rawEvents[featureCount - 1].timestamp) : 'None'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--medflow-surface-light)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--medflow-text-primary)] mb-3">System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--medflow-success)] rounded-full"></div>
              <span>UTM Tracking: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--medflow-success)] rounded-full"></div>
              <span>Feature Analytics: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--medflow-success)] rounded-full"></div>
              <span>Data Storage: Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// UTM Tracking Tab Component
const UTMTab: React.FC<{ data: any[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-xl font-semibold text-[var(--medflow-text-primary)] mb-2">No UTM Data</h3>
        <p className="text-[var(--medflow-text-secondary)]">UTM tracking data will appear here when users visit from marketing campaigns.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--medflow-text-primary)]">UTM Parameter Tracking</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--medflow-border)]">
          <thead className="bg-[var(--medflow-surface-light)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">Medium</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">Step</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">Referrer</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--medflow-surface-dark)] divide-y divide-[var(--medflow-border)]">
            {data.map((event, index) => (
              <tr key={index} className="hover:bg-[var(--medflow-surface-light)]">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-primary)]">
                  {formatTime(event.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-primary)]">
                  {event.utm.utm_source || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-primary)]">
                  {event.utm.utm_campaign || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-primary)]">
                  {event.utm.utm_medium || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-primary)]">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.conversionStep === 'website_visit' ? 'bg-[var(--medflow-info)] text-[var(--medflow-info-dark)]' :
                    event.conversionStep === 'dashboard_click' ? 'bg-[var(--medflow-success)] text-[var(--medflow-success-dark)]' :
                    event.conversionStep === 'app_landing' ? 'bg-[var(--medflow-primary)] text-[var(--medflow-primary-light)]' :
                    'bg-[var(--medflow-surface-light)] text-[var(--medflow-text-secondary)]'
                  }`}>
                    {event.conversionStep}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-secondary)] max-w-xs truncate">
                  {event.referrer || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Features Tab Component
const FeaturesTab: React.FC<{ data: any }> = ({ data }) => {
  const features = data.featureUsage || [];

  if (features.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚡</div>
        <h3 className="text-xl font-semibold text-[var(--medflow-text-primary)] mb-2">No Feature Data</h3>
        <p className="text-[var(--medflow-text-secondary)]">Feature usage data will appear here as users interact with the app.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--medflow-text-primary)]">Feature Usage Analytics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.map((feature: any) => (
          <div key={feature.featureId} className="bg-[var(--medflow-surface-light)] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[var(--medflow-text-primary)]">{feature.featureName}</h3>
              <span className="text-sm text-[var(--medflow-text-secondary)]">{feature.category}</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Usage:</span>
                <span className="font-medium">{feature.totalUsage}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-medium">{feature.successRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Duration:</span>
                <span className="font-medium">{formatDuration(feature.averageDuration)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Used:</span>
                <span className="font-medium">{formatTime(feature.lastUsed)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Conversion Tab Component
const ConversionTab: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--medflow-text-primary)]">Conversion Funnel Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[var(--medflow-info-light)] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[var(--medflow-info)] mb-2">{data.websiteVisits || 0}</div>
          <div className="text-sm text-[var(--medflow-info-dark)]">Website Visits</div>
        </div>
        
        <div className="bg-[var(--medflow-success-light)] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[var(--medflow-success)] mb-2">{data.appLandings || 0}</div>
          <div className="text-sm text-[var(--medflow-success-dark)]">App Landings</div>
        </div>
        
        <div className="bg-[var(--medflow-primary-light)] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[var(--medflow-primary)] mb-2">{data.featureUsage || 0}</div>
          <div className="text-sm text-[var(--medflow-primary-dark)]">Feature Usage</div>
        </div>
        
        <div className="bg-[var(--medflow-warning-light)] rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[var(--medflow-warning)] mb-2">
            {data.conversionRate ? `${data.conversionRate.toFixed(1)}%` : '0%'}
          </div>
          <div className="text-sm text-[var(--medflow-warning-dark)]">Conversion Rate</div>
        </div>
      </div>

      <div className="bg-[var(--medflow-surface-light)] rounded-lg p-4">
        <h3 className="font-semibold text-[var(--medflow-text-primary)] mb-3">Funnel Insights</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Average Time to Feature:</span>
            <span className="font-medium">
              {data.averageTimeToFeature ? formatDuration(data.averageTimeToFeature) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Drop-off Rate:</span>
            <span className="font-medium">
              {data.websiteVisits && data.featureUsage 
                ? `${((data.websiteVisits - data.featureUsage) / data.websiteVisits * 100).toFixed(1)}%`
                : 'N/A'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab: React.FC<{ data: any[] }> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-[var(--medflow-text-primary)] mb-2">No User Data</h3>
        <p className="text-[var(--medflow-text-secondary)]">User behavior data will appear here as users interact with the app.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--medflow-text-primary)]">User Behavior Analytics</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--medflow-border)]">
          <thead className="bg-[var(--medflow-surface-light)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">Features Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">Last Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--medflow-text-tertiary)] uppercase tracking-wider">Session Count</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--medflow-surface-dark)] divide-y divide-[var(--medflow-border)]">
            {data.map((user, index) => (
              <tr key={index} className="hover:bg-[var(--medflow-surface-light)]">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--medflow-text-primary)]">
                  {user.userId}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--medflow-text-primary)]">
                  <div className="flex flex-wrap gap-1">
                    {user.featuresUsed.slice(0, 3).map((feature: string) => (
                      <span key={feature} className="px-2 py-1 bg-[var(--medflow-info-light)] text-[var(--medflow-info)] text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                    {user.featuresUsed.length > 3 && (
                      <span className="px-2 py-1 bg-[var(--medflow-surface-light)] text-[var(--medflow-text-secondary)] text-xs rounded-full">
                        +{user.featuresUsed.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-primary)]">
                  {formatTime(user.lastActivity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--medflow-text-primary)]">
                  {user.totalSessions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: any;
  color: string;
  description: string;
}> = ({ title, value, icon: Icon, color, description }) => {
  const colorClasses = {
    blue: 'bg-[var(--medflow-info-light)] text-[var(--medflow-info)]',
    green: 'bg-[var(--medflow-success-light)] text-[var(--medflow-success)]',
    purple: 'bg-[var(--medflow-primary-light)] text-[var(--medflow-primary)]',
    orange: 'bg-[var(--medflow-warning-light)] text-[var(--medflow-warning)]'
  };

  return (
    <div className="bg-[var(--medflow-surface-elevated)] rounded-lg border border-[var(--medflow-border)] p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-[var(--medflow-text-secondary)]">{title}</p>
          <p className="text-2xl font-semibold text-[var(--medflow-text-primary)]">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--medflow-text-tertiary)]">{description}</p>
    </div>
  );
};

export default AnalyticsDashboard;
