import { FramerSite } from '../components/FramerIntegration';

// 🚀 **FRAMER WEBSITE INTEGRATION CONFIGURATION**
// 
// To add your Framer website:
// 1. Publish your site on Framer.com
// 2. Copy the published URL (e.g., https://your-site.framer.app)
// 3. Add it to the sites array below
// 4. Save this file - everything else is automatic!

export const framerSites: FramerSite[] = [
  {
    id: 'framer-website',
    name: 'Framer Website',
    url: 'https://compassionate-colors-919784.framer.app',
    description: 'App official website'
  }
];

// Default site to show when no specific site is selected
export const defaultFramerSiteId = framerSites[0]?.id || '';

// Configuration options
export const framerConfig = {
  // Show site selector when multiple sites are available
  showSiteSelector: true,
  
  // Default iframe height (can be overridden per route)
  defaultHeight: '600px',
  
  // Enable/disable loading animations
  showLoadingSpinner: true,
  
  // Enable/disable error handling
  showErrorHandling: true,
  
  // Sandbox permissions for iframe
  iframeSandbox: 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals',
  
  // Allowed iframe features
  iframeAllow: 'fullscreen; camera; microphone; geolocation'
};
