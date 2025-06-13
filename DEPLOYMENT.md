/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

# Environment Configuration & Deployment Guide

## Overview

This application supports three environments:
- **Local** - For local development
- **Dev** - For development/staging server
- **Production** - For production deployment

## Environment Files

| Environment | File | Purpose |
|-------------|------|---------|
| Local | `environment.local.ts` | Local development with debug features |
| Dev | `environment.dev.ts` | Development server with monitoring |
| Production | `environment.prod.ts` | Production with optimizations |

## NPM Scripts

### Development
```bash
npm start              # Start local development server
npm run start:local    # Start local development server
npm run start:dev      # Start with dev configuration
npm run start:prod     # Start with production configuration
```

### Building
```bash
npm run build          # Build for production
npm run build:local    # Build for local testing
npm run build:dev      # Build for dev deployment
npm run build:prod     # Build for production deployment
```

### Deployment
```bash
npm run deploy:dev     # Build and prepare for dev deployment
npm run deploy:prod    # Build and prepare for production deployment
```

### Utilities
```bash
npm run env:info       # Show available environment configurations
npm run watch          # Watch and rebuild for local
npm run watch:dev      # Watch and rebuild for dev
```

## Environment Configuration

### Local Development
- **API URL**: `http://localhost:3000/api`
- **Debug**: Enabled with full logging
- **Optimizations**: Disabled for faster builds
- **Source Maps**: Enabled
- **Features**: All debugging features enabled

### Dev Environment
- **API URL**: `https://api-dev.northernpacifictech.com/api`
- **Debug**: Info level logging
- **Optimizations**: Enabled
- **Source Maps**: Enabled
- **Features**: Monitoring enabled

### Production Environment
- **API URL**: `https://api.northernpacifictech.com/api`
- **Debug**: Error level logging only
- **Optimizations**: Full optimization
- **Source Maps**: Disabled
- **Features**: Monitoring enabled, debugging disabled

## Deployment Steps

### Dev Deployment
1. Run `npm run deploy:dev`
2. Upload `dist/` folder to dev server
3. Configure web server to serve from `dist/pareto-ui/`
4. Update DNS/proxy to point to dev API

### Production Deployment
1. Run `npm run deploy:prod`
2. Upload `dist/` folder to production server
3. Configure web server with proper headers and caching
4. Update DNS/proxy to point to production API
5. Monitor application performance

## Configuration Checklist

### Before Deployment
- [ ] Update API URLs in environment files
- [ ] Configure authentication endpoints
- [ ] Set appropriate logging levels
- [ ] Enable/disable feature flags
- [ ] Verify build sizes and budgets
- [ ] Test with target environment configuration

### Production Checklist
- [ ] Disable debug features
- [ ] Enable error reporting
- [ ] Configure analytics
- [ ] Set up monitoring
- [ ] Verify security headers
- [ ] Test performance

## Troubleshooting

### Build Issues
- Check environment file imports
- Verify Angular configuration in `angular.json`
- Check TypeScript configuration

### Runtime Issues
- Verify API URLs are accessible
- Check browser console for errors
- Verify environment is loading correctly

## Environment Variables

See `.env.example` for a template of environment-specific variables that can be configured.
