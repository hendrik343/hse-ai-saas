/**
 * Environment configuration template
 * Copy this file to environment.ts and fill in your actual values
 */

***REMOVED***
  ***REMOVED***

    // Firebase Configuration
    firebase: {
        apiKey: 'your-firebase-api-key',
        authDomain: 'your-project.firebaseapp.com',
        projectId: 'your-project-id',
        storageBucket: 'your-project.appspot.com',
        messagingSenderId: '123456789',
        appId: 'your-app-id',
        measurementId: 'your-measurement-id'
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
***REMOVED*** 