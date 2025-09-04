/**
 * 🚀 Feature Usage Analytics Service
 * 
 * Tracks user interaction with app features to understand usage patterns
 * Provides insights for product optimization and user experience improvement
 */

export interface FeatureEvent {
  featureId: string;           // Unique feature identifier
  featureName: string;         // Human-readable feature name
  action: string;              // Action performed (click, view, submit, etc.)
  category: string;            // Feature category (appointments, patients, analytics)
  timestamp: number;           // When the event occurred
  userId?: string;             // User ID if authenticated
  sessionId: string;           // Session identifier
  metadata?: Record<string, any>; // Additional context data
  duration?: number;           // Time spent on feature (if applicable)
  success?: boolean;           // Whether the action was successful
}

export interface FeatureUsage {
  featureId: string;
  featureName: string;
  category: string;
  totalUsage: number;
  uniqueUsers: number;
  averageDuration: number;
  successRate: number;
  lastUsed: number;
  userSatisfaction?: number; // Future: user ratings
}

export interface UserBehavior {
  userId: string;
  sessionId: string;
  featuresUsed: string[];
  totalSessions: number;
  averageSessionDuration: number;
  mostUsedFeatures: string[];
  lastActivity: number;
  conversionPath: string[]; // Path from website to feature usage
}

class FeatureAnalyticsService {
  private static instance: FeatureAnalyticsService;
  private sessionId: string;
  private featureEvents: FeatureEvent[] = [];
  private featureTimers: Map<string, number> = new Map();
  private isInitialized = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): FeatureAnalyticsService {
    if (!FeatureAnalyticsService.instance) {
      FeatureAnalyticsService.instance = new FeatureAnalyticsService();
    }
    return FeatureAnalyticsService.instance;
  }

  /**
   * Initialize feature analytics
   */
  public initialize(): void {
    if (this.isInitialized) return;

    console.log('🚀 Feature Analytics: Starting initialization...');
    
    this.isInitialized = true;
    this.loadStoredEvents();
    this.setupEventListeners();
    
    console.log('🚀 Feature Analytics initialized successfully');
    console.log('📊 Feature Analytics: Current session ID:', this.sessionId);
  }

  /**
   * Track feature usage event
   */
  public trackFeatureUsage(
    featureId: string,
    featureName: string,
    action: string,
    category: string,
    metadata?: Record<string, any>
  ): void {
    const event: FeatureEvent = {
      featureId,
      featureName,
      action,
      category,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      metadata,
      success: true // Default to true, can be updated later
    };

    this.featureEvents.push(event);
    this.storeEvent(event);
    this.sendToAnalytics('feature_usage', event);

    console.log(`📊 Feature Usage: ${featureName} - ${action}`, event);
  }

  /**
   * Start timing a feature interaction
   */
  public startFeatureTimer(featureId: string): void {
    this.featureTimers.set(featureId, Date.now());
  }

  /**
   * End timing and track duration
   */
  public endFeatureTimer(featureId: string, success: boolean = true): void {
    const startTime = this.featureTimers.get(featureId);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.featureTimers.delete(featureId);

    // Find the last event for this feature and update it
    const lastEvent = this.featureEvents
      .filter(e => e.featureId === featureId)
      .pop();

    if (lastEvent) {
      lastEvent.duration = duration;
      lastEvent.success = success;
      this.updateStoredEvent(lastEvent);
    }
  }

  /**
   * Track page view/feature view
   */
  public trackFeatureView(featureId: string, featureName: string, category: string): void {
    this.trackFeatureUsage(featureId, featureName, 'view', category);
    this.startFeatureTimer(featureId);
  }

  /**
   * Track feature interaction (click, submit, etc.)
   */
  public trackFeatureInteraction(
    featureId: string,
    featureName: string,
    action: string,
    category: string,
    metadata?: Record<string, any>
  ): void {
    this.trackFeatureUsage(featureId, featureName, action, category, metadata);
  }

  /**
   * Track feature completion
   */
  public trackFeatureCompletion(
    featureId: string,
    featureName: string,
    category: string,
    success: boolean = true,
    metadata?: Record<string, any>
  ): void {
    this.endFeatureTimer(featureId, success);
    
    this.trackFeatureUsage(featureId, featureName, 'complete', category, {
      ...metadata,
      success,
      completed: true
    });
  }

  /**
   * Get feature usage statistics
   */
  public getFeatureUsageStats(): FeatureUsage[] {
    const featureMap = new Map<string, FeatureUsage>();

    this.featureEvents.forEach(event => {
      if (!featureMap.has(event.featureId)) {
        featureMap.set(event.featureId, {
          featureId: event.featureId,
          featureName: event.featureName,
          category: event.category,
          totalUsage: 0,
          uniqueUsers: 0,
          averageDuration: 0,
          successRate: 0,
          lastUsed: 0
        });
      }

      const feature = featureMap.get(event.featureId)!;
      feature.totalUsage++;
      feature.lastUsed = Math.max(feature.lastUsed, event.timestamp);

      if (event.duration) {
        feature.averageDuration = (feature.averageDuration + event.duration) / 2;
      }

      if (event.success !== undefined) {
        const successCount = this.featureEvents.filter(e => 
          e.featureId === event.featureId && e.success === true
        ).length;
        const totalCount = this.featureEvents.filter(e => 
          e.featureId === event.featureId && e.success !== undefined
        ).length;
        feature.successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;
      }
    });

    return Array.from(featureMap.values());
  }

  /**
   * Get user behavior analytics
   */
  public getUserBehavior(userId?: string): UserBehavior[] {
    const userMap = new Map<string, UserBehavior>();

    this.featureEvents.forEach(event => {
      const id = userId || event.userId || 'anonymous';
      
      if (!userMap.has(id)) {
        userMap.set(id, {
          userId: id,
          sessionId: event.sessionId,
          featuresUsed: [],
          totalSessions: 1,
          averageSessionDuration: 0,
          mostUsedFeatures: [],
          lastActivity: event.timestamp,
          conversionPath: []
        });
      }

      const user = userMap.get(id)!;
      
      if (!user.featuresUsed.includes(event.featureId)) {
        user.featuresUsed.push(event.featureId);
      }

      user.lastActivity = Math.max(user.lastActivity, event.timestamp);
    });

    return Array.from(userMap.values());
  }

  /**
   * Get conversion funnel data
   */
  public getConversionFunnel(): any {
    const websiteVisits = this.featureEvents.filter(e => e.category === 'website');
    const appLandings = this.featureEvents.filter(e => e.category === 'app');
    const featureUsage = this.featureEvents.filter(e => e.category !== 'website' && e.category !== 'app');

    return {
      websiteVisits: websiteVisits.length,
      appLandings: appLandings.length,
      featureUsage: featureUsage.length,
      conversionRate: websiteVisits.length > 0 ? (featureUsage.length / websiteVisits.length) * 100 : 0,
      averageTimeToFeature: this.calculateAverageTimeToFeature()
    };
  }

  /**
   * Calculate average time from website visit to first feature usage
   */
  private calculateAverageTimeToFeature(): number {
    const websiteEvents = this.featureEvents.filter(e => e.category === 'website');
    const featureEvents = this.featureEvents.filter(e => e.category !== 'website' && e.category !== 'app');

    if (websiteEvents.length === 0 || featureEvents.length === 0) return 0;

    let totalTime = 0;
    let count = 0;

    websiteEvents.forEach(websiteEvent => {
      const nextFeature = featureEvents.find(f => f.timestamp > websiteEvent.timestamp);
      if (nextFeature) {
        totalTime += nextFeature.timestamp - websiteEvent.timestamp;
        count++;
      }
    });

    return count > 0 ? totalTime / count : 0;
  }

  /**
   * Get all analytics data for export
   */
  public getAllAnalyticsData(): any {
    return {
      featureUsage: this.getFeatureUsageStats(),
      userBehavior: this.getUserBehavior(),
      conversionFunnel: this.getConversionFunnel(),
      rawEvents: this.featureEvents,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };
  }

  /**
   * Clear analytics data
   */
  public clearAnalyticsData(): void {
    this.featureEvents = [];
    this.featureTimers.clear();
    sessionStorage.removeItem('medflowFeatureAnalytics');
    console.log('🧹 Feature analytics data cleared');
  }

  /**
   * Store event in session storage
   */
  private storeEvent(event: FeatureEvent): void {
    try {
      const existing = sessionStorage.getItem('medflowFeatureAnalytics');
      const events = existing ? JSON.parse(existing) : [];
      
      events.push(event);
      
      // Keep only last 200 events to prevent storage overflow
      if (events.length > 200) {
        events.splice(0, events.length - 200);
      }
      
      sessionStorage.setItem('medflowFeatureAnalytics', JSON.stringify(events));
    } catch (error) {
      console.warn('Could not store feature analytics data:', error);
    }
  }

  /**
   * Update stored event
   */
  private updateStoredEvent(updatedEvent: FeatureEvent): void {
    try {
      const existing = sessionStorage.getItem('medflowFeatureAnalytics');
      const events = existing ? JSON.parse(existing) : [];
      
      const index = events.findIndex((e: FeatureEvent) => 
        e.featureId === updatedEvent.featureId && 
        e.timestamp === updatedEvent.timestamp
      );
      
      if (index !== -1) {
        events[index] = updatedEvent;
        sessionStorage.setItem('medflowFeatureAnalytics', JSON.stringify(events));
      }
    } catch (error) {
      console.warn('Could not update stored feature analytics data:', error);
    }
  }

  /**
   * Load stored events from session storage
   */
  private loadStoredEvents(): void {
    try {
      const stored = sessionStorage.getItem('medflowFeatureAnalytics');
      if (stored) {
        this.featureEvents = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load stored feature analytics data:', error);
    }
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.trackFeatureUsage('app', 'MedFlow App', 'page_visible', 'app');
      }
    });

    // Track beforeunload for session duration
    window.addEventListener('beforeunload', () => {
      this.trackFeatureUsage('app', 'MedFlow App', 'session_end', 'app');
    });
  }

  /**
   * Send data to analytics services
   */
  private sendToAnalytics(eventType: string, data: FeatureEvent): void {
    // Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', eventType, {
        feature_id: data.featureId,
        feature_name: data.featureName,
        action: data.action,
        category: data.category,
        session_id: data.sessionId,
        timestamp: data.timestamp,
        duration: data.duration,
        success: data.success
      });
    }

    // Facebook Pixel
    if (typeof (window as any).fbq !== 'undefined') {
      (window as any).fbq('track', eventType, {
        feature_name: data.featureName,
        action: data.action,
        category: data.category
      });
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `feature_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const featureAnalytics = FeatureAnalyticsService.getInstance();
export default featureAnalytics;
