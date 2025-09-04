import React from 'react';
import { FramerWebsiteManager } from '../components/FramerIntegration';
import { framerSites, framerConfig } from '../config/framerSites';

const FramerWebsitePage: React.FC = () => {
  return (
    <div className="w-full h-screen">
      <FramerWebsiteManager
        sites={framerSites}
        showSiteSelector={framerSites.length > 1}
        className="w-full h-full"
      />
    </div>
  );
};

export default FramerWebsitePage;
