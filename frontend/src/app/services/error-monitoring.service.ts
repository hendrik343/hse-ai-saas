import { ErrorHandler, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface ErrorContext {
    component?: string;
    action?: string;
    userId?: string;
    timestamp: Date;
    userAgent: string;
    url: string;
    stack?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ErrorMonitoringService {
    private errorCount = 0;
    private readonly MAX_ERRORS_PER_MINUTE = 10;

    constructor(
        private toastService: ToastService,
        private translate: TranslateService
    ) { }

    /**
     * Track and handle application errors
     */
    trackError(error: Error, context?: Partial<ErrorContext>): void {
        this.errorCount++;

        // Prevent error spam
        if (this.errorCount > this.MAX_ERRORS_PER_MINUTE) {
            console.warn('Too many errors, throttling error reporting');
            return;
        }

        const errorContext: ErrorContext = {
            component: context?.component || 'Unknown',
            action: context?.action || 'Unknown',
            userId: context?.userId || 'Anonymous',
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            stack: error.stack
        };

        // Log to console in development
        if (!environment.production) {
            console.error('Error occurred:', error, errorContext);
        }

        // Send to external monitoring service (Sentry, LogRocket, etc.)
        this.sendToMonitoringService(error, errorContext);

        // Track in analytics
        this.trackInAnalytics(errorContext);

        // Show user-friendly message
        this.showUserFriendlyError(error);
    }

    /**
     * Track non-error events for monitoring
     */
    trackEvent(eventName: string, metadata?: any): void {
        const eventData = {
            event: eventName,
            timestamp: new Date(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...metadata
        };

        // Send to analytics
        this.trackInAnalytics(eventData);
    }

    /**
     * Track performance metrics
     */
    trackPerformance(metricName: string, value: number, metadata?: any): void {
        const performanceData = {
            metric: metricName,
            value,
            timestamp: new Date(),
            url: window.location.href,
            ...metadata
        };

        // Send to analytics
        this.trackInAnalytics(performanceData);
    }

    /**
     * Track user interactions
     */
    trackUserAction(action: string, component: string, metadata?: any): void {
        this.trackEvent('user_action', {
            action,
            component,
            ...metadata
        });
    }

    private sendToMonitoringService(error: Error, context: ErrorContext): void {
        // Implementation for external monitoring service
        // Example: Sentry, LogRocket, etc.
        try {
            // This would be replaced with actual monitoring service integration
            if (typeof window !== 'undefined' && (window as any).Sentry) {
                (window as any).Sentry.captureException(error, {
                    extra: context
                });
            }
        } catch (monitoringError) {
            console.warn('Failed to send error to monitoring service:', monitoringError);
        }
    }

    private trackInAnalytics(data: any): void {
        // Implementation for analytics service
        // Example: Google Analytics, Mixpanel, etc.
        try {
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', 'error', {
                    event_category: 'error',
                    event_label: data.event || 'unknown',
                    value: data.value || 1
                });
            }
        } catch (analyticsError) {
            console.warn('Failed to track in analytics:', analyticsError);
        }
    }

    private showUserFriendlyError(error: Error): void {
        // Map technical errors to user-friendly messages
        const userMessage = this.getUserFriendlyMessage(error);

        this.toastService.showError(userMessage);
    }

    private getUserFriendlyMessage(error: Error): string {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            return this.translate.instant('ERRORS.NETWORK_ERROR');
        }

        if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
            return this.translate.instant('ERRORS.AUTH_ERROR');
        }

        if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
            return this.translate.instant('ERRORS.LIMIT_ERROR');
        }

        // Default error message
        return this.translate.instant('ERRORS.GENERIC_ERROR');
    }

    /**
     * Reset error count (called periodically)
     */
    resetErrorCount(): void {
        this.errorCount = 0;
    }
}

/**
 * Global error handler that catches all unhandled errors
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private errorMonitoring: ErrorMonitoringService) { }

    handleError(error: Error): void {
        this.errorMonitoring.trackError(error, {
            component: 'Global',
            action: 'Unhandled Error'
        });
    }
} 