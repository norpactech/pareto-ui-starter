/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

export const environment = {
  production: false,
  development: true,
  environmentName: 'local',
  apiUrl: 'http://localhost:3000/api',
  authUrl: 'http://localhost:3000/api/auth',
  wsUrl: 'ws://localhost:3000',
  enableLogging: true,
  enableDebugInfo: true,
  logLevel: 'debug',
  features: {
    enableAnalytics: false,
    enableErrorReporting: false,
    enablePerformanceMonitoring: false,
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
    showDebugPanel: true
  }
};
