/**
 * 🚀 UTM Parameter Tracking Service
 * 
 * Captures and stores marketing attribution data from Framer website to MedFlow app
 * Provides complete visibility into marketing campaign performance
 */

export interface UTMParams {
  utm_source?: string;      // Traffic source (google, facebook, email)
  utm_medium?: string;      // Marketing medium (cpc, email, social)
  utm_campaign?: string;    // Campaign name (summer_sale, newsletter)
  utm_term?: string;        // Keywords (medical_app, appointment_system)
  utm_content?: string;     // Content variation (button_a, banner_b)
  utm_id?: string;          // Campaign ID for tracking
}

export interface TrackingData {
  utm: UTMParams;
  referrer: string;
  userAgent: string;
  timestamp: number;
  sessionId: string;
  pageUrl: string;
  conversionStep: 'website_visit' | 'dashboard_click' | 'app_landing' | 'feature_usage';
}

export interface ConversionFunnel {
  websiteVisit: TrackingData;
  dashboardClick?: TrackingData;
  appLanding?: TrackingData;
  featureUsage?: TrackingData[];
  conversionTime: number; // Time from website visit to first feature usage
  completed: boolean;
}

class UTMTrackingService {
  private static instance: UTMTrackingService;
  private sessionId: string;
  private conversionData: Map<string, ConversionFunnel> = new Map();

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
  }

  public static getInstance(): UTMTrackingService {
    if (!UTMTrackingService.instance) {
      UTMTrackingService.instance = new UTMTrackingService();
    }
    return UTMTrackingService.instance;
  }

  /**
   * Initialize UTM tracking on page load
   */
  private initializeTracking(): void {
    // Capture UTM parameters from URL
    const utmParams = this.extractUTMParams();
    
    // Debug logging
    console.log('🔍 UTM Tracking Debug:', {
      currentUrl: window.location.href,
      extractedUTM: utmParams,
      hasUTMParams: Object.keys(utmParams).length > 0,
      referrer: document.referrer
    });
    
    // Store initial tracking data
    if (Object.keys(utmParams).length > 0) {
      console.log('✅ UTM Parameters found, tracking event...');
      this.trackEvent('website_visit', {
        utm: utmParams,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        pageUrl: window.location.href,
        conversionStep: 'website_visit'
      });
      
      // Also store UTM data in session storage for this domain
      sessionStorage.setItem('medflowUTMData', JSON.stringify({
        utm: utmParams,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        referrer: document.referrer,
        pageUrl: window.location.href
      }));
      
      console.log('💾 UTM data stored in session storage');
    } else {
      console.log('❌ No UTM parameters found in URL');
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.trackEvent('page_visible', { timestamp: Date.now() });
      }
    });
  }

  /**
   * Extract UTM parameters from current URL
   */
  private extractUTMParams(): UTMParams {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: UTMParams = {};

    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];
    
    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key as keyof UTMParams] = value;
      }
    });

    return utmParams;
  }

  /**
   * Track conversion event
   */
  public trackEvent(eventType: string, data: Partial<TrackingData>): void {
    const trackingData: TrackingData = {
      utm: data.utm || {},
      referrer: data.referrer || document.referrer,
      userAgent: data.userAgent || navigator.userAgent,
      timestamp: data.timestamp || Date.now(),
      sessionId: data.sessionId || this.sessionId,
      pageUrl: data.pageUrl || window.location.href,
      conversionStep: data.conversionStep || 'website_visit'
    };

    // Store in session storage for persistence
    this.storeTrackingData(trackingData);

    // Log to console for debugging
    console.log(`🚀 UTM Tracking: ${eventType}`, trackingData);

    // Send to analytics service (if available)
    this.sendToAnalytics(eventType, trackingData);
  }

  /**
   * Track conversion funnel step
   */
  public trackConversionStep(step: string, additionalData?: any): void {
    const trackingData: TrackingData = {
      utm: this.getCurrentUTM(),
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      conversionStep: step as 'website_visit' | 'dashboard_click' | 'app_landing' | 'feature_usage'
    };

    // Update conversion funnel
    this.updateConversionFunnel(step, trackingData);

    // Track the event
    this.trackEvent(`conversion_${step}`, { ...trackingData, ...additionalData });
  }

  /**
   * Get current UTM parameters
   */
  public getCurrentUTM(): UTMParams {
    const stored = sessionStorage.getItem('medflowUTMData');
    if (stored) {
      const data = JSON.parse(stored);
      return data.utm || {};
    }
    return {};
  }

  /**
   * Get complete conversion funnel data
   */
  public getConversionFunnel(sessionId?: string): ConversionFunnel | null {
    const targetSessionId = sessionId || this.sessionId;
    return this.conversionData.get(targetSessionId) || null;
  }

  /**
   * Get all tracking data for analytics
   */
  public getAllTrackingData(): TrackingData[] {
    const stored = sessionStorage.getItem('medflowUTMData');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  /**
   * Store tracking data in session storage
   */
  private storeTrackingData(data: TrackingData): void {
    try {
      const existing = sessionStorage.getItem('medflowUTMData');
      const trackingArray = existing ? JSON.parse(existing) : [];
      
      // Add new data
      trackingArray.push(data);
      
      // Keep only last 100 entries to prevent storage overflow
      if (trackingArray.length > 100) {
        trackingArray.splice(0, trackingArray.length - 100);
      }
      
      sessionStorage.setItem('medflowUTMData', JSON.stringify(trackingArray));
    } catch (error) {
      console.warn('Could not store UTM tracking data:', error);
    }
  }

  /**
   * Update conversion funnel with new step
   */
  private updateConversionFunnel(step: string, data: TrackingData): void {
    const funnel = this.conversionData.get(this.sessionId) || {
      websiteVisit: data,
      conversionTime: 0,
      completed: false
    };

    switch (step) {
      case 'dashboard_click':
        funnel.dashboardClick = data;
        break;
      case 'app_landing':
        funnel.appLanding = data;
        break;
      case 'feature_usage':
        if (!funnel.featureUsage) {
          funnel.featureUsage = [];
        }
        funnel.featureUsage.push(data);
        break;
    }

    // Calculate conversion time
    if (funnel.websiteVisit && funnel.featureUsage && funnel.featureUsage.length > 0) {
      funnel.conversionTime = funnel.featureUsage[0].timestamp - funnel.websiteVisit.timestamp;
      funnel.completed = true;
    }

    this.conversionData.set(this.sessionId, funnel);
  }

  /**
   * Send tracking data to analytics service
   */
  private sendToAnalytics(eventType: string, data: TrackingData): void {
    // Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', eventType, {
        utm_source: data.utm.utm_source,
        utm_medium: data.utm.utm_medium,
        utm_campaign: data.utm.utm_campaign,
        utm_term: data.utm.utm_term,
        utm_content: data.utm.utm_content,
        utm_id: data.utm.utm_id,
        conversion_step: data.conversionStep,
        session_id: data.sessionId,
        timestamp: data.timestamp
      });
    }

    // Facebook Pixel
    if (typeof (window as any).fbq !== 'undefined') {
      (window as any).fbq('track', eventType, {
        utm_source: data.utm.utm_source,
        utm_medium: data.utm.utm_medium,
        utm_campaign: data.utm.utm_campaign,
        conversion_step: data.conversionStep
      });
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear tracking data (for testing or privacy)
   */
  public clearTrackingData(): void {
    sessionStorage.removeItem('medflowUTMData');
    this.conversionData.clear();
    console.log('🧹 UTM tracking data cleared');
  }
}

export const utmTracking = UTMTrackingService.getInstance();
export default utmTracking;
