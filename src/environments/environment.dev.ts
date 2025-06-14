/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

export const environment = {
  production: false,
  development: true,
  environmentName: 'dev',
  apiUrl: 'https://api-dev.northernpacifictech.com/api',
  wsUrl: 'wss://api-dev.northernpacifictech.com',
  enableLogging: true,
  enableDebugInfo: true,
  logLevel: 'info',  cognito: {
    region: 'us-west-2',
    userPoolId: 'us-west-2_kYxBT6G5H',
    userPoolClientId: '7172bfnjgp98t3pjhj0ktj7360'
  },
  features: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableFeatureFlags: true
  },
  auth: {
    tokenRefreshBuffer: 300000, // 5 minutes in milliseconds
    sessionTimeout: 3600000, // 1 hour in milliseconds
    enableRememberMe: true
  },
  ui: {
    enableThemeToggle: true,
    defaultTheme: 'light',
    enableAnimations: true,
    showDebugPanel: false
  }
};
