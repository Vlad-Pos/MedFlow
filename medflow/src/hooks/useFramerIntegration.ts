import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 🚀 Framer Integration Hook
 * 
 * Handles seamless navigation between Framer website and MedFlow app
 * with focus on performance and user experience
 */

export interface FramerNavigationOptions {
  preserveState?: boolean;
  showWelcomeMessage?: boolean;
  redirectTo?: string;
  source?: 'framer-website' | 'framer-landing' | 'external';
}

export interface FramerUserContext {
  source: string;
  timestamp: number;
  referrer: string;
  utmParams?: Record<string, string>;
}

export const useFramerIntegration = () => {
  const navigate = useNavigate();
  const [userContext, setUserContext] = useState<FramerUserContext | null>(null);
  const [shouldShowWelcome, setShouldShowWelcome] = useState(false);

  /**
   * Initialize cross-origin message listener for Framer communication
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from Framer domains
      if (isValidFramerOrigin(event.origin)) {
        handleFramerMessage(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /**
   * Check if user came from Framer website on mount
   */
  useEffect(() => {
    const navigation = sessionStorage.getItem('framerNavigation');
    if (navigation) {
      const data = JSON.parse(navigation);
      const isRecent = (Date.now() - data.timestamp) < 30000; // 30 seconds
      setShouldShowWelcome(data.showWelcome && isRecent);
    }

    const context = sessionStorage.getItem('framerUserContext');
    if (context) {
      setUserContext(JSON.parse(context));
    }
  }, []);

  /**
   * Validate message origin for security
   */
  const isValidFramerOrigin = (origin: string): boolean => {
    const validOrigins = [
      'https://framer.app',
      'https://framer.com',
      'https://compassionate-colors-919784.framer.app' // Your specific domain
    ];
    return validOrigins.some(valid => origin.startsWith(valid));
  };

  /**
   * Handle incoming messages from Framer website
   */
  const handleFramerMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'NAVIGATE_TO_APP':
        navigateToApp(data.payload);
        break;
      case 'USER_CONTEXT':
        setUserContext(data.payload);
        break;
      case 'TRACK_EVENT':
        trackFramerEvent(data.payload);
        break;
    }
  }, []);

  /**
   * Navigate from Framer website to MedFlow app
   */
  const navigateToApp = useCallback((options: FramerNavigationOptions = {}) => {
    const {
      preserveState = true,
      showWelcomeMessage = true,
      redirectTo = '/dashboard',
      source = 'framer-website'
    } = options;

    // Set user context for tracking
    const context: FramerUserContext = {
      source,
      timestamp: Date.now(),
      referrer: document.referrer
    };
    
    setUserContext(context);

    // Store navigation context in session storage for smooth handoff
    if (preserveState) {
      sessionStorage.setItem('framerNavigation', JSON.stringify({
        source,
        timestamp: Date.now(),
        showWelcome: showWelcomeMessage
      }));
    }

    // Store user context
    sessionStorage.setItem('framerUserContext', JSON.stringify(context));

    // Navigate to the app
    navigate(redirectTo, { replace: true });

    // Post navigation event for analytics
    trackNavigationEvent(source, redirectTo);
  }, [navigate]);

  /**
   * Check if user came from Framer website
   */
  const isFromFramer = useCallback((): boolean => {
    return userContext?.source?.includes('framer') || false;
  }, [userContext]);

  /**
   * Clear navigation context after use
   */
  const clearNavigationContext = useCallback(() => {
    sessionStorage.removeItem('framerNavigation');
    setShouldShowWelcome(false);
  }, []);

  /**
   * Track navigation events for analytics
   */
  const trackNavigationEvent = useCallback((source: string, destination: string) => {
    // You can integrate with your analytics service here
    console.log('Framer Navigation:', { source, destination, timestamp: Date.now() });
    
    // Example: Google Analytics 4 event (declare global type)
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'framer_navigation', {
        source,
        destination,
        timestamp: Date.now()
      });
    }
  }, []);

  /**
   * Track custom events from Framer
   */
  const trackFramerEvent = useCallback((eventData: any) => {
    console.log('Framer Event:', eventData);
    
    // Integrate with your analytics service
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'framer_event', eventData);
    }
  }, []);

  return {
    userContext,
    shouldShowWelcome,
    isFromFramer,
    navigateToApp,
    clearNavigationContext,
    trackFramerEvent
  };
};
