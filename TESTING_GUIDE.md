# Testing Guide

This project uses Node.js-based test runners for reliable integration testing.

## Test Types

### 1. **Unit/Integration Tests (Mocked)**
- Use mocked HTTP responses
- Test service logic and error handling
- Fast execution, no external dependencies

### 2. **Live API Tests (End-to-End)**
- Hit real API endpoints
- Test actual network communication
- Validate environment configuration
- Require running API server

## Quick Start

### Run Health Check Tests

**Simple Health Check (Recommended):**
```bash
# From VS Code: Ctrl+Shift+P > Tasks: Run Task > "Run Health Check Test"
# Or from terminal:
node src/tests/integration/commons/health-check-runner.js
```

**Jest Health Check Test:**
```bash
# From VS Code: Ctrl+Shift+P > Tasks: Run Task > "Run Live Health API Test"
# Or from terminal:
npm run test:jest -- src/tests/integration/commons/health.live-api.spec.ts
```

### Run UserService Integration Test (Mocked)

**Recommended Method (Manual Test Runner):**
```bash
# From VS Code: Ctrl+Shift+P > Tasks: Run Task > "Run Manual UserService Test"
# Or from terminal:
node src/tests/integration/manual-test-runner.js
```

**Jest Method (may have configuration issues):**
```bash
# From VS Code: Ctrl+Shift+P > Tasks: Run Task > "Run UserService Integration Test"
# Or from terminal:
npm run test:jest -- src/tests/integration/user-service.integration.spec.ts
```

### Run Live API Tests (Real API)

**Simple Live API Test (Recommended):**
```bash
# From VS Code: Ctrl+Shift+P > Tasks: Run Task > "Run Simple Live API Test"
# Or from terminal:
node src/tests/integration/live-api-test-runner.js
```

**Jest Live API Test (may have configuration issues):**
```bash
# From VS Code: Ctrl+Shift+P > Tasks: Run Task > "Run Live API Integration Test"
# Or from terminal:
npm run test:jest -- src/tests/integration/user-service.live-api.spec.ts
```

## Test Files

### Integration Tests
- `src/tests/integration/user-service.integration.spec.ts` - Mocked integration test
- `src/tests/integration/user-service.live-api.spec.ts` - Live API integration test
- `src/tests/integration/commons/health.live-api.spec.ts` - Health endpoint test
- `src/tests/integration/manual-test-runner.js` - Manual test validation runner
- `src/tests/integration/live-api-test-runner.js` - Simple live API test runner
- `src/tests/integration/commons/health-check-runner.js` - Simple health check runner

### Component Tests
- `src/tests/components/confirmation-dialog.component.spec.ts` - Dialog component test
- `src/app/user/components/user-list/user-list.component.spec.ts` - User list component

## Live API Testing

The live API tests validate your UserService against the real API server defined in your environment configuration.

### Prerequisites
- API server must be running at the configured URL
- Current environment: `http://localhost:3000/api` (from environment.local.ts)

### What Live API Tests Validate
✅ **API Server Connectivity** - Server is reachable and responding  
✅ **User GET Operations** - Retrieve user by ID from live API  
✅ **User Search Operations** - Search users with criteria  
✅ **API Health Checks** - Service availability validation  
✅ **Error Handling** - Real error responses from API  
✅ **Network Communication** - Actual HTTP requests/responses  

### Live API Test Types
This is called **End-to-End (E2E) Integration Testing** or **Live API Testing**:
- Tests real network communication
- Validates environment configuration
- Provides true integration validation
- No mocking - hits actual endpoints

## UserService Integration Test Coverage

### Mocked Integration Test
✅ **Service Initialization**
- Service creation and dependency injection validation
- BaseService inheritance verification
- Required methods availability check

✅ **HTTP Operations**
- GET operations with proper response handling
- Error scenarios (404, 500, network errors)
- HTTP client mocking and verification

✅ **Angular Integration**
- TestBed configuration
- HttpClientTestingModule integration
- Material modules (MatDialog, MatSnackBar)
- Environment service configuration

## VS Code Tasks

Available tasks via `Ctrl+Shift+P > Tasks: Run Task`:

1. **Run Health Check Test** ✅ - Simple health endpoint validation  
2. **Run Manual UserService Test** ✅ - Reliable mocked validation
3. **Run Simple Live API Test** ✅ - Live API validation (requires API server)
4. **Run Live Health API Test** ⚠️ - Jest-based health test (may hang)
5. **Run UserService Integration Test** ⚠️ - Jest-based mocked test (may hang)
6. **Run Live API Integration Test** ⚠️ - Jest-based live test (may hang)
7. **Run All Tests** ⚠️ - All Jest tests (may hang)

## Known Issues

- Jest may hang due to `jest-preset-angular` configuration issues on Windows
- Manual test runners provide equivalent validation and are recommended
- Live API tests require a running API server at the configured URL
- See `JEST_CONFIGURATION_ISSUES.md` for technical details

## Configuration Files

- `jest.config.js` - Streamlined Jest configuration
- `tsconfig.spec.json` - TypeScript configuration for tests
- `src/test-setup.ts` - Jest setup and global mocks
- `.vscode/tasks.json` - VS Code task definitions
- `src/environments/environment.local.ts` - API URL configuration
