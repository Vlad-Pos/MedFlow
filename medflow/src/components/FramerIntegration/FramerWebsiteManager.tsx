import React, { useState, useEffect } from 'react';
import { FramerWebsite } from './FramerWebsite';

export interface FramerSite {
  id: string;
  name: string;
  url: string;
  description?: string;
  isActive?: boolean;
}

interface FramerWebsiteManagerProps {
  sites: FramerSite[];
  defaultSiteId?: string;
  className?: string;
  showSiteSelector?: boolean;
}

export const FramerWebsiteManager: React.FC<FramerWebsiteManagerProps> = ({
  sites,
  defaultSiteId,
  className = '',
  showSiteSelector = true
}) => {
  const [activeSiteId, setActiveSiteId] = useState(defaultSiteId || sites[0]?.id || '');
  const [activeSite, setActiveSite] = useState<FramerSite | null>(null);

  useEffect(() => {
    const site = sites.find(s => s.id === activeSiteId);
    setActiveSite(site || null);
  }, [activeSiteId, sites]);

  const handleSiteChange = (siteId: string) => {
    setActiveSiteId(siteId);
  };

  if (!sites.length) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-xl font-semibold mb-2">No Framer Websites Configured</h3>
          <p className="text-gray-600">Please add your Framer website URLs to get started.</p>
        </div>
      </div>
    );
  }

  // If only one site, show it directly without any panels
  if (sites.length === 1) {
    const site = sites[0];
    return (
      <div className={`w-full h-full ${className}`}>
        <FramerWebsite
          url={site.url}
          title={site.name}
          className="w-full h-full"
        />
      </div>
    );
  }

  // Multiple sites - show selector and website
  return (
    <div className={`w-full h-full ${className}`}>
      {showSiteSelector && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Select Website</h3>
          <div className="flex flex-wrap gap-2">
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => handleSiteChange(site.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeSiteId === site.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {site.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeSite && (
        <div className="space-y-4">
          <div className="h-[600px] rounded-lg overflow-hidden border">
            <FramerWebsite
              url={activeSite.url}
              title={activeSite.name}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
