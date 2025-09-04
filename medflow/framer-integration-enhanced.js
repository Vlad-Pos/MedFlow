/**
 * 🚀 Enhanced MedFlow Integration Script for Framer
 * 
 * This script provides comprehensive tracking and analytics integration
 * between your Framer website and the MedFlow app
 * 
 * Features:
 * - UTM parameter tracking
 * - Conversion funnel analysis
 * - Feature usage analytics
 * - Seamless navigation to app
 * - User context preservation
 */

(function() {
  'use strict';

  // Configuration - UPDATE THESE VALUES
  const MEDFLOW_APP_URL = 'http://localhost:5174'; // Replace with your actual app URL
  const FRAMER_DOMAIN = 'https://compassionate-colors-919784.framer.app'; // Your specific Framer domain
  
  // Analytics configuration
  const ANALYTICS_ENABLED = true;
  const DEBUG_MODE = false; // Set to true for development

  // Global variables
  let sessionId = null;
  let startTime = Date.now();
  let pageViews = 0;
  let userInteractions = [];

  /**
   * Initialize the integration
   */
  function initialize() {
    if (typeof window === 'undefined') return;
    
    // Generate session ID
    sessionId = generateSessionId();
    
    // Track page load
    trackPageView();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize UTM tracking
    initializeUTMTracking();
    
    // Log initialization
    log('🚀 MedFlow Integration initialized', {
      sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
    
    // Expose API globally
    window.medflowIntegration = {
      navigateToApp,
      setUserContext,
      trackEvent,
      getAnalyticsData,
      clearAnalyticsData
    };
  }

  /**
   * Generate unique session ID
   */
  function generateSessionId() {
    return `framer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track page view
   */
  function trackPageView() {
    pageViews++;
    
    const event = {
      type: 'page_view',
      timestamp: Date.now(),
      sessionId,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      pageViews,
      timeOnSite: Date.now() - startTime
    };
    
    trackEvent('page_view', event);
    log('📄 Page view tracked', event);
  }

  /**
   * Initialize UTM parameter tracking
   */
  function initializeUTMTracking() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};
    
    // Extract UTM parameters
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'].forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key] = value;
        log(`🎯 UTM Parameter found: ${key} = ${value}`);
      }
    });
    
    // Store UTM data
    if (Object.keys(utmParams).length > 0) {
      sessionStorage.setItem('medflowUTM', JSON.stringify({
        ...utmParams,
        timestamp: Date.now(),
        sessionId,
        referrer: document.referrer
      }));
      
      // Track UTM event
      trackEvent('utm_detected', {
        utm: utmParams,
        timestamp: Date.now(),
        sessionId,
        url: window.location.href
      });
    }
  }

  /**
   * Setup event listeners for user interactions
   */
  function setupEventListeners() {
    // Track button clicks
    document.addEventListener('click', function(e) {
      const target = e.target;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        trackButtonClick(button);
      }
      
      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target : target.closest('a');
        trackLinkClick(link);
      }
    });

    // Track form interactions
    document.addEventListener('submit', function(e) {
      trackFormSubmission(e.target);
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Track every 25%
          trackEvent('scroll_depth', {
            depth: maxScroll,
            timestamp: Date.now(),
            sessionId
          });
        }
      }
    });

    // Track time on page
    setInterval(function() {
      const timeOnPage = Date.now() - startTime;
      if (timeOnPage % 30000 === 0) { // Track every 30 seconds
        trackEvent('time_on_page', {
          timeOnPage,
          timestamp: Date.now(),
          sessionId
        });
      }
    }, 1000);

    // Track before unload
    window.addEventListener('beforeunload', function() {
      trackEvent('page_exit', {
        timeOnPage: Date.now() - startTime,
        pageViews,
        sessionId,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Track button click
   */
  function trackButtonClick(button) {
    const buttonText = button.textContent?.trim() || 'Unknown Button';
    const buttonId = button.id || button.className || 'no-id';
    
    trackEvent('button_click', {
      buttonText,
      buttonId,
      timestamp: Date.now(),
      sessionId,
      url: window.location.href
    });
    
    // Special tracking for Dashboard button
    if (buttonText.toLowerCase().includes('dashboard') || buttonId.toLowerCase().includes('dashboard')) {
      trackEvent('dashboard_button_click', {
        buttonText,
        buttonId,
        timestamp: Date.now(),
        sessionId,
        url: window.location.href
      });
    }
  }

  /**
   * Track link click
   */
  function trackLinkClick(link) {
    const linkText = link.textContent?.trim() || 'Unknown Link';
    const linkHref = link.href || 'no-href';
    
    trackEvent('link_click', {
      linkText,
      linkHref,
      timestamp: Date.now(),
      sessionId,
      url: window.location.href
    });
  }

  /**
   * Track form submission
   */
  function trackFormSubmission(form) {
    const formId = form.id || form.className || 'no-id';
    const formAction = form.action || 'no-action';
    
    trackEvent('form_submission', {
      formId,
      formAction,
      timestamp: Date.now(),
      sessionId,
      url: window.location.href
    });
  }

  /**
   * Track custom event
   */
  function trackEvent(eventType, data) {
    if (!ANALYTICS_ENABLED) return;
    
    const event = {
      eventType,
      timestamp: Date.now(),
      sessionId,
      url: window.location.href,
      ...data
    };
    
    // Store in session storage
    storeEvent(event);
    
    // Send to analytics services
    sendToAnalytics(eventType, event);
    
    // Log in debug mode
    if (DEBUG_MODE) {
      log(`📊 Event tracked: ${eventType}`, event);
    }
  }

  /**
   * Store event in session storage
   */
  function storeEvent(event) {
    try {
      const existing = sessionStorage.getItem('medflowEvents');
      const events = existing ? JSON.parse(existing) : [];
      
      events.push(event);
      
      // Keep only last 100 events
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      sessionStorage.setItem('medflowEvents', JSON.stringify(events));
    } catch (error) {
      console.warn('Could not store event:', error);
    }
  }

  /**
   * Send data to analytics services
   */
  function sendToAnalytics(eventType, data) {
    // Google Analytics 4
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', eventType, {
        event_category: 'framer_integration',
        event_label: data.url,
        value: data.timestamp,
        custom_parameters: {
          session_id: data.sessionId,
          framer_domain: FRAMER_DOMAIN
        }
      });
    }

    // Facebook Pixel
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', eventType, {
        content_name: data.url,
        content_category: 'framer_integration'
      });
    }
  }

  /**
   * Navigate to MedFlow app
   */
  function navigateToApp(options = {}) {
    const {
      redirectTo = '/dashboard',
      preserveContext = true,
      trackEvent = true
    } = options;

    // Get UTM data from current page URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};
    
    // Extract UTM parameters from current page
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'].forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key] = value;
      }
    });
    
    // Get user context
    const userContext = {
      source: 'framer_website',
      sessionId,
      timestamp: Date.now(),
      pageViews,
      timeOnSite: Date.now() - startTime,
      utm: utmParams,
      referrer: document.referrer,
      currentUrl: window.location.href
    };
    
    // Store context for app (this will work if same domain)
    if (preserveContext) {
      sessionStorage.setItem('medflowUserContext', JSON.stringify(userContext));
    }
    
    // Track navigation event
    if (trackEvent) {
      trackEvent('app_navigation', {
        redirectTo,
        userContext,
        timestamp: Date.now(),
        sessionId
      });
    }
    
    // Build navigation URL
    const appUrl = new URL(redirectTo, MEDFLOW_APP_URL);
    
    // Add UTM parameters to app URL (this ensures they're passed across domains)
    Object.keys(utmParams).forEach(key => {
      if (utmParams[key]) {
        appUrl.searchParams.set(key, utmParams[key]);
      }
    });
    
    // Add context parameters
    appUrl.searchParams.set('from_framer', 'true');
    appUrl.searchParams.set('session_id', sessionId);
    appUrl.searchParams.set('timestamp', Date.now().toString());
    
    // Add UTM data as individual parameters for better tracking
    if (utmParams.utm_source) appUrl.searchParams.set('utm_source', utmParams.utm_source);
    if (utmParams.utm_medium) appUrl.searchParams.set('utm_medium', utmParams.utm_medium);
    if (utmParams.utm_campaign) appUrl.searchParams.set('utm_campaign', utmParams.utm_campaign);
    if (utmParams.utm_term) appUrl.searchParams.set('utm_term', utmParams.utm_term);
    if (utmParams.utm_content) appUrl.searchParams.set('utm_content', utmParams.utm_content);
    if (utmParams.utm_id) appUrl.searchParams.set('utm_id', utmParams.utm_id);
    
    // Navigate to app
    log('🚀 Navigating to MedFlow app', {
      url: appUrl.toString(),
      userContext
    });
    
    window.location.href = appUrl.toString();
  }

  /**
   * Set user context data
   */
  function setUserContext(context) {
    const currentContext = JSON.parse(sessionStorage.getItem('medflowUserContext') || '{}');
    const updatedContext = { ...currentContext, ...context };
    
    sessionStorage.setItem('medflowUserContext', JSON.stringify(updatedContext));
    
    trackEvent('user_context_updated', {
      context: updatedContext,
      timestamp: Date.now(),
      sessionId
    });
    
    log('👤 User context updated', updatedContext);
  }

  /**
   * Get analytics data
   */
  function getAnalyticsData() {
    const events = JSON.parse(sessionStorage.getItem('medflowEvents') || '[]');
    const utm = JSON.parse(sessionStorage.getItem('medflowUTM') || '{}');
    const userContext = JSON.parse(sessionStorage.getItem('medflowUserContext') || '{}');
    
    return {
      events,
      utm,
      userContext,
      session: {
        sessionId,
        startTime,
        pageViews,
        timeOnSite: Date.now() - startTime
      },
      timestamp: Date.now()
    };
  }

  /**
   * Clear analytics data
   */
  function clearAnalyticsData() {
    sessionStorage.removeItem('medflowEvents');
    sessionStorage.removeItem('medflowUTM');
    sessionStorage.removeItem('medflowUserContext');
    
    log('🧹 Analytics data cleared');
  }

  /**
   * Utility function for logging
   */
  function log(message, data = null) {
    if (DEBUG_MODE) {
      if (data) {
        console.log(`[MedFlow Integration] ${message}`, data);
      } else {
        console.log(`[MedFlow Integration] ${message}`);
      }
    }
  }

  /**
   * Auto-initialize when DOM is ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  /**
   * Fallback initialization for older browsers
   */
  if (typeof window !== 'undefined' && !window.medflowIntegration) {
    setTimeout(initialize, 100);
  }

})();

/**
 * 📋 USAGE INSTRUCTIONS
 * 
 * 1. Replace MEDFLOW_APP_URL with your actual app domain
 * 2. Update FRAMER_DOMAIN if needed
 * 3. Add this script to your Framer website
 * 4. Use the global API:
 * 
 * // Navigate to app
 * window.medflowIntegration.navigateToApp({
 *   redirectTo: '/dashboard',
 *   preserveContext: true
 * });
 * 
 * // Track custom event
 * window.medflowIntegration.trackEvent('custom_action', {
 *   action: 'button_click',
 *   value: 'important_button'
 * });
 * 
 * // Set user context
 * window.medflowIntegration.setUserContext({
 *   userType: 'prospect',
 *   interest: 'appointments'
 * });
 * 
 * // Get analytics data
 * const data = window.medflowIntegration.getAnalyticsData();
 */
