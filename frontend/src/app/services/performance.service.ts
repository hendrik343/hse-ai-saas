import { Injectable, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ErrorMonitoringService } from './error-monitoring.service';

export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: Date;
    url: string;
    metadata?: any;
}

export interface PageLoadMetrics {
    navigationStart: number;
    domContentLoaded: number;
    loadComplete: number;
    firstContentfulPaint?: number;
    largestContentfulPaint?: number;
    cumulativeLayoutShift?: number;
    firstInputDelay?: number;
}

@Injectable({
    providedIn: 'root'
})
export class PerformanceService {
    private navigationStartTime: number = 0;
    private currentPageMetrics: PageLoadMetrics | null = null;

    constructor(
        private router: Router,
        private ngZone: NgZone,
        private errorMonitoring: ErrorMonitoringService
    ) {
        this.initializePerformanceMonitoring();
    }

    /**
     * Initialize performance monitoring
     */
    private initializePerformanceMonitoring(): void {
        // Track page navigation performance
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(() => {
                this.trackPageNavigation();
            });

        // Track initial page load
        if (typeof window !== 'undefined') {
            this.trackInitialPageLoad();
        }
    }

    /**
     * Track initial page load performance
     */
    private trackInitialPageLoad(): void {
        if (performance && performance.getEntriesByType) {
            const navigation = performance.getEntriesByType('navigation')[0] as any;

            if (navigation) {
                const metrics: PageLoadMetrics = {
                    navigationStart: navigation.navigationStart || 0,
                    domContentLoaded: (navigation.domContentLoadedEventEnd || 0) - (navigation.navigationStart || 0),
                    loadComplete: (navigation.loadEventEnd || 0) - (navigation.navigationStart || 0)
                ***REMOVED***

                // Track Core Web Vitals if available
                this.trackCoreWebVitals(metrics);

                this.currentPageMetrics = metrics;
                this.trackPageLoadPerformance(metrics);
            }
        }
    }

    /**
     * Track Core Web Vitals
     */
    private trackCoreWebVitals(metrics: PageLoadMetrics): void {
        // First Contentful Paint (FCP)
        if ('PerformanceObserver' in window) {
            try {
                const fcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const fcp = entries[entries.length - 1];
                    metrics.firstContentfulPaint = fcp.startTime;
                    this.trackPerformanceMetric('FCP', fcp.startTime, 'ms');
                });
                fcpObserver.observe({ entryTypes: ['paint'] });
            } catch (error) {
                console.warn('FCP tracking not supported');
            }

            // Largest Contentful Paint (LCP)
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lcp = entries[entries.length - 1];
                    metrics.largestContentfulPaint = lcp.startTime;
                    this.trackPerformanceMetric('LCP', lcp.startTime, 'ms');
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (error) {
                console.warn('LCP tracking not supported');
            }

            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        const layoutShiftEntry = entry as any;
                        if (!layoutShiftEntry.hadRecentInput) {
                            clsValue += layoutShiftEntry.value;
                        }
                    }
                    metrics.cumulativeLayoutShift = clsValue;
                    this.trackPerformanceMetric('CLS', clsValue, 'score');
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (error) {
                console.warn('CLS tracking not supported');
            }

            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        const firstInputEntry = entry as any;
                        const fid = firstInputEntry.processingStart - firstInputEntry.startTime;
                        metrics.firstInputDelay = fid;
                        this.trackPerformanceMetric('FID', fid, 'ms');
                    }
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (error) {
                console.warn('FID tracking not supported');
            }
        }
    }

    /**
     * Track page navigation performance
     */
    private trackPageNavigation(): void {
        this.navigationStartTime = performance.now();

        // Track navigation timing
        setTimeout(() => {
            const navigationTime = performance.now() - this.navigationStartTime;
            this.trackPerformanceMetric('navigation_time', navigationTime, 'ms', {
                url: window.location.href
            });
        }, 100);
    }

    /**
     * Track page load performance
     */
    private trackPageLoadPerformance(metrics: PageLoadMetrics): void {
        // Track DOM Content Loaded
        this.trackPerformanceMetric('DOMContentLoaded', metrics.domContentLoaded, 'ms');

        // Track Load Complete
        this.trackPerformanceMetric('LoadComplete', metrics.loadComplete, 'ms');

        // Track overall page load performance
        this.trackPerformanceMetric('PageLoad', metrics.loadComplete, 'ms', {
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    }

    /**
     * Track custom performance metric
     */
    trackPerformanceMetric(name: string, value: number, unit: string, metadata?: any): void {
        const metric: PerformanceMetric = {
            name,
            value,
            unit,
            timestamp: new Date(),
            url: window.location.href,
            metadata
        ***REMOVED***

        // Send to error monitoring service for analytics
        this.errorMonitoring.trackPerformance(name, value, {
            unit,
            url: window.location.href,
            ...metadata
        });

        // Log in development
        if (!environment.production) {
            console.log(`Performance Metric - ${name}: ${value}${unit}`, metadata);
        }
    }

    /**
     * Track user interaction performance
     */
    trackUserInteraction(action: string, startTime: number, endTime: number, metadata?: any): void {
        const duration = endTime - startTime;

        this.trackPerformanceMetric('user_interaction', duration, 'ms', {
            action,
            ...metadata
        });

        // Track slow interactions
        if (duration > 100) {
            this.trackPerformanceMetric('slow_interaction', duration, 'ms', {
                action,
                threshold: 100,
                ...metadata
            });
        }
    }

    /**
     * Track API call performance
     */
    trackApiCall(endpoint: string, duration: number, status: number, metadata?: any): void {
        this.trackPerformanceMetric('api_call', duration, 'ms', {
            endpoint,
            status,
            ...metadata
        });

        // Track slow API calls
        if (duration > 1000) {
            this.trackPerformanceMetric('slow_api_call', duration, 'ms', {
                endpoint,
                status,
                threshold: 1000,
                ...metadata
            });
        }
    }

    /**
     * Track memory usage
     */
    trackMemoryUsage(): void {
        if ('memory' in performance) {
            const memory = (performance as any).memory;

            this.trackPerformanceMetric('memory_used', memory.usedJSHeapSize, 'bytes');
            this.trackPerformanceMetric('memory_total', memory.totalJSHeapSize, 'bytes');
            this.trackPerformanceMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes');
        }
    }

    /**
     * Get current page metrics
     */
    getCurrentPageMetrics(): PageLoadMetrics | null {
        return this.currentPageMetrics;
    }

    /**
     * Measure function execution time
     */
    measureFunction<T>(fn: () => T, name: string): T {
        const startTime = performance.now();
        try {
            const result = fn();
            const endTime = performance.now();
            this.trackPerformanceMetric(`function_${name}`, endTime - startTime, 'ms');
            return result;
        } catch (error) {
            const endTime = performance.now();
            this.trackPerformanceMetric(`function_${name}_error`, endTime - startTime, 'ms');
            throw error;
        }
    }

    /**
     * Measure async function execution time
     */
    async measureAsyncFunction<T>(fn: () => Promise<T>, name: string): Promise<T> {
        const startTime = performance.now();
        try {
            const result = await fn();
            const endTime = performance.now();
            this.trackPerformanceMetric(`async_function_${name}`, endTime - startTime, 'ms');
            return result;
        } catch (error) {
            const endTime = performance.now();
            this.trackPerformanceMetric(`async_function_${name}_error`, endTime - startTime, 'ms');
            throw error;
        }
    }
} 