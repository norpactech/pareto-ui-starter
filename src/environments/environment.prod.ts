/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

export const environment = {
  production: true,
  development: false,
  environmentName: 'production',
  apiUrl: 'https://api.northernpacifictech.com/api',
  authUrl: 'https://api.northernpacifictech.com/api/auth',
  wsUrl: 'wss://api.northernpacifictech.com',
  enableLogging: false,
  enableDebugInfo: false,
  logLevel: 'error',
  features: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableFeatureFlags: false
  },
  auth: {
    tokenRefreshBuffer: 300000, // 5 minutes in milliseconds
    sessionTimeout: 7200000, // 2 hours in milliseconds
    enableRememberMe: true
  },
  ui: {
    enableThemeToggle: true,
    defaultTheme: 'light',
    enableAnimations: true,
    showDebugPanel: false
  }
};
