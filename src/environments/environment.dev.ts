/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

export const environment = {
  production: false,
  development: true,
  environmentName: 'dev',
  apiUrl: 'https://api-dev.northernpacifictech.com/api',
  authUrl: 'https://api-dev.northernpacifictech.com/api/auth',
  wsUrl: 'wss://api-dev.northernpacifictech.com',
  enableLogging: true,
  enableDebugInfo: true,
  logLevel: 'info',
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
