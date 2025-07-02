/**
 * Environment configuration template
 * Copy this file to environment.ts and fill in your actual values
 */

export const environment = {
    production: false,

    // Firebase Configuration
    firebase: {
        apiKey: 'AIzaSyBzoX3mxJCTiaR4CMm99lmB8NfLlkt9Otk',
        authDomain: 'hse-ai-saas.firebaseapp.com',
        projectId: 'hse-ai-saas',
        storageBucket: 'hse-ai-saas.appspot.com',
        messagingSenderId: '674061620385',
        appId: '1:674061620385:web:fbf66dfc81cd9168728ce0',
        measurementId: 'G-MCC4GG1VJE'
    },

    // AI Service Configuration
    aiService: {
        apiKey: 'your-google-ai-api-key',
        model: 'gemini-1.5-flash',
        maxTokens: 2048,
        temperature: 0.3
    },

    // Analytics Configuration
    analytics: {
        googleAnalyticsId: 'your-ga-id',
        sentryDsn: 'your-sentry-dsn',
        logRocketId: 'your-logrocket-id'
    },

    // Feature Flags
    features: {
        enableAnalytics: true,
        enableErrorMonitoring: true,
        enablePerformanceMonitoring: true,
        enableCaching: true,
        enablePWA: true
    },

    // API Configuration
    api: {
        baseUrl: 'https://your-api-domain.com',
        timeout: 30000,
        retryAttempts: 3
    },

    // Cache Configuration
    cache: {
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
        cleanupInterval: 60 * 1000 // 1 minute
    },

    // Performance Configuration
    performance: {
        enableCoreWebVitals: true,
        enableMemoryMonitoring: true,
        slowInteractionThreshold: 100, // ms
        slowApiCallThreshold: 1000 // ms
    },

    // Internationalization
    i18n: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'pt', 'fr'],
        fallbackLanguage: 'en'
    },

    // Security Configuration
    security: {
        enableCSP: true,
        enableHSTS: true,
        enableXSSProtection: true,
        maxLoginAttempts: 5,
        sessionTimeout: 30 * 60 * 1000 // 30 minutes
    }
}; 