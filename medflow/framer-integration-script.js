/**
 * 🚀 MedFlow App Integration Script for Framer Website
 * 
 * Add this script to your Framer website to enable seamless navigation
 * to the MedFlow app dashboard.
 * 
 * Instructions:
 * 1. In Framer, go to your website project
 * 2. Add a "Custom Code" element
 * 3. Paste this entire script
 * 4. Your Dashboard button will now work seamlessly!
 * 
 * 💡 IMPORTANT: Before modifying this script, please read:
 * - MedFlow/BRAND_IDENTITY.md (brand requirements)
 * - MedFlow/DEVELOPMENT_GUIDE.md (technical standards)
 * This ensures your changes maintain MedFlow's professional standards.
 */

(function() {
  'use strict';

  // 💡 REMINDER: This script follows MedFlow brand standards
  // For modifications, please review BRAND_IDENTITY.md and DEVELOPMENT_GUIDE.md
  // This ensures consistency with MedFlow's professional medical platform

  // Configuration
  const MEDFLOW_APP_URL = 'http://localhost:5174'; // Replace with your actual app URL
  const FRAMER_DOMAIN = 'https://compassionate-colors-919784.framer.app';

  // MedFlow Integration API
  window.medflowIntegration = {
    /**
     * Navigate from Framer website to MedFlow app
     * @param {Object} options - Navigation options
     * @param {string} options.redirectTo - App route (default: '/dashboard')
     * @param {boolean} options.preserveState - Preserve user context (default: true)
     * @param {boolean} options.showWelcomeMessage - Show welcome banner (default: true)
     * @param {Object} options.userContext - Additional user context data
     */
    navigateToApp: function(options = {}) {
      const {
        redirectTo = '/dashboard',
        preserveState = true,
        showWelcomeMessage = true,
        userContext = {}
      } = options;

      // Set user context
      this.setUserContext({
        source: 'framer-website',
        timestamp: Date.now(),
        referrer: document.referrer,
        currentPage: window.location.pathname,
        ...userContext
      });

      // Track navigation event
      this.trackEvent('dashboard_navigation', {
        from: window.location.pathname,
        to: redirectTo,
        timestamp: Date.now()
      });

      // Try to communicate with parent window (if embedded)
      if (this.tryPostMessageCommunication()) {
        return;
      }

      // Fallback: direct navigation with context
      const appUrl = new URL(redirectTo, MEDFLOW_APP_URL);
      appUrl.searchParams.set('source', 'framer-website');
      appUrl.searchParams.set('timestamp', Date.now().toString());
      
      if (preserveState) {
        appUrl.searchParams.set('preserveState', 'true');
      }
      
      if (showWelcomeMessage) {
        appUrl.searchParams.set('showWelcome', 'true');
      }

      // Smooth transition
      this.showTransitionOverlay();
      
      setTimeout(() => {
        window.location.href = appUrl.toString();
      }, 300);
    },

    /**
     * Set user context for tracking and personalization
     * @param {Object} context - User context data
     */
    setUserContext: function(context) {
      try {
        // Store in session storage
        sessionStorage.setItem('medflowUserContext', JSON.stringify({
          ...context,
          setAt: Date.now()
        }));

        // Try to communicate with parent window
        this.tryPostMessageCommunication('USER_CONTEXT', context);
      } catch (error) {
        console.warn('Could not set user context:', error);
      }
    },

    /**
     * Track custom events for analytics
     * @param {string} eventName - Event name
     * @param {Object} eventData - Event data
     */
    trackEvent: function(eventName, eventData) {
      try {
        // Google Analytics 4 (if available)
        if (typeof gtag !== 'undefined') {
          gtag('event', eventName, {
            ...eventData,
            source: 'framer-website',
            timestamp: Date.now()
          });
        }

        // Facebook Pixel (if available)
        if (typeof fbq !== 'undefined') {
          fbq('track', eventName, eventData);
        }

        // Custom tracking
        console.log('MedFlow Event:', eventName, eventData);
        
        // Try to communicate with parent window
        this.tryPostMessageCommunication('TRACK_EVENT', {
          eventName,
          eventData
        });
      } catch (error) {
        console.warn('Could not track event:', error);
      }
    },

    /**
     * Try to communicate with parent window via postMessage
     * @param {string} type - Message type
     * @param {Object} payload - Message payload
     * @returns {boolean} - Success status
     */
    tryPostMessageCommunication: function(type = 'NAVIGATE_TO_APP', payload = {}) {
      try {
        const targetWindow = window.parent || window.opener;
        
        if (targetWindow && targetWindow !== window) {
          targetWindow.postMessage({
            type: type,
            payload: payload,
            source: 'framer-website',
            timestamp: Date.now()
          }, '*');
          
          return true;
        }
      } catch (error) {
        console.warn('PostMessage communication failed:', error);
      }
      
      return false;
    },

    /**
     * Show smooth transition overlay
     */
    showTransitionOverlay: function() {
      // Create transition overlay
      const overlay = document.createElement('div');
      overlay.id = 'medflow-transition-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #3B82F6, #7C3AED);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      // Add content
      overlay.innerHTML = `
        <div style="text-align: center; color: white;">
          <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
          <div style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">
            Taking you to MedFlow...
          </div>
          <div style="font-size: 16px; opacity: 0.8;">
            Please wait while we redirect you to the app
          </div>
        </div>
      `;

      // Add to page
      document.body.appendChild(overlay);
      
      // Show overlay
      setTimeout(() => {
        overlay.style.opacity = '1';
      }, 10);
    },

    /**
     * Initialize integration
     */
    init: function() {
      // Track page view
      this.trackEvent('page_view', {
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer
      });

      // Set up automatic context
      this.setUserContext({
        source: 'framer-website',
        timestamp: Date.now(),
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        language: navigator.language
      });

      console.log('🚀 MedFlow Integration initialized successfully!');
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.medflowIntegration.init();
    });
  } else {
    window.medflowIntegration.init();
  }

  // Make it globally accessible
  window.medflow = window.medflow || {};
  window.medflow.integration = window.medflowIntegration;

})();

/**
 * 📱 HOW TO USE IN FRAMER:
 * 
 * 1. In your Framer project, add a "Custom Code" element
 * 2. Paste this entire script
 * 3. On your Dashboard button, add this action:
 *    - Action: "Run JavaScript"
 *    - Code: `window.medflowIntegration.navigateToApp()`
 * 
 * 4. For custom navigation, use:
 *    - `window.medflowIntegration.navigateToApp({ redirectTo: '/appointments' })`
 *    - `window.medflowIntegration.navigateToApp({ showWelcomeMessage: false })`
 * 
 * 5. For tracking, use:
 *    - `window.medflowIntegration.trackEvent('button_click', { button: 'dashboard' })`
 * 
 * 🎯 RESULT: Seamless navigation from website to app with context preservation!
 */
