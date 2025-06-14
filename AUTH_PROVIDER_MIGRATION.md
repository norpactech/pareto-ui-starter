# Authentication Provider Interface Migration Guide

## Overview

This guide explains how to migrate from the direct `CognitoAuthService` usage to the new provider-agnostic `AuthService` interface. This change allows for easy switching between different OAuth providers (Cognito, Firebase, Auth0, etc.) without changing component code.

## Architecture

### New Structure:
```
IAuthProvider (interface)
├── BaseAuthProvider (abstract class)
├── CognitoAuthProvider (Cognito implementation)
├── FirebaseAuthProvider (future implementation)
└── Auth0AuthProvider (future implementation)

AuthProviderFactory (creates provider instances)
AuthService (wrapper service that uses current provider)
```

## Migration Steps

### 1. Update Component Imports

**Before:**
```typescript
import { CognitoAuthService } from '../../services/cognito-auth.service';

constructor(private cognitoAuth: CognitoAuthService) {}
```

**After:**
```typescript
import { AuthService } from '../../services/auth-provider.service';

constructor(private authService: AuthService) {}
```

### 2. Update Method Calls

The method signatures remain the same, but the service reference changes:

**Before:**
```typescript
this.cognitoAuth.signIn(request).subscribe(...)
this.cognitoAuth.signUp(request).subscribe(...)
this.cognitoAuth.signOut().subscribe(...)
```

**After:**
```typescript
this.authService.signIn(request).subscribe(...)
this.authService.signUp(request).subscribe(...)
this.authService.signOut().subscribe(...)
```

### 3. Update Observable Subscriptions

**Before:**
```typescript
this.cognitoAuth.authState$.subscribe(state => ...)
this.cognitoAuth.currentUser$.subscribe(user => ...)
```

**After:**
```typescript
this.authService.authState$.subscribe(state => ...)
this.authService.currentUser$.subscribe(user => ...)
```

## Components to Update

The following components need to be migrated:

1. **SignInComponent** (`src/app/auth/components/sign-in/`)
2. **SignUpComponent** (`src/app/auth/components/sign-up/`)
3. **ForgotPasswordComponent** (`src/app/auth/components/forgot-password/`)
4. **VerifyEmailComponent** (`src/app/auth/components/verify-email/`)
5. **CompleteProfileComponent** (`src/app/profile/complete-profile.component.ts`)
6. **AuthGuard** (`src/app/auth/guards/auth.guard.ts`)
7. **AuthInterceptor** (`src/app/auth/interceptors/auth.interceptor.ts`)

## Example Migration

### SignInComponent Migration

**Before:**
```typescript
import { CognitoAuthService } from '../../services/cognito-auth.service';

export class SignInComponent {
  constructor(private cognitoAuth: CognitoAuthService) {}

  onSignIn(): void {
    const request = {
      email: this.signInForm.value.email,
      password: this.signInForm.value.password
    };
    
    this.cognitoAuth.signIn(request).subscribe({
      next: (response) => {
        // Handle success
      },
      error: (error) => {
        // Handle error
      }
    });
  }
}
```

**After:**
```typescript
import { AuthService } from '../../services/auth-provider.service';
import { SignInRequest } from '../../interfaces/auth-provider.interface';

export class SignInComponent {
  constructor(private authService: AuthService) {}

  onSignIn(): void {
    const request: SignInRequest = {
      email: this.signInForm.value.email,
      password: this.signInForm.value.password
    };
    
    this.authService.signIn(request).subscribe({
      next: (response) => {
        // Handle success
      },
      error: (error) => {
        // Handle error
      }
    });
  }
}
```

## Benefits

1. **Provider Agnostic**: Easy to switch between different OAuth providers
2. **Type Safety**: Standardized interfaces with TypeScript support
3. **Error Handling**: Consistent error types across all providers
4. **Future Proof**: Easy to add new providers without changing existing code
5. **Testing**: Easier to mock and test with standardized interfaces

## Adding New Providers

To add a new OAuth provider (e.g., Firebase):

1. Create a new provider class that extends `BaseAuthProvider`
2. Implement all required methods
3. Add the provider to the `AuthProviderFactory`
4. Update the environment configuration

Example:
```typescript
export class FirebaseAuthProvider extends BaseAuthProvider {
  // Implement all required methods
}
```

## Environment Configuration

Add provider configuration to your environment files:

```typescript
export const environment = {
  // ... other config
  authProvider: {
    type: 'cognito', // or 'firebase', 'auth0', etc.
    config: {
      // Provider-specific configuration
    }
  }
};
```

## Next Steps

1. Update all components to use the new `AuthService`
2. Test the migration thoroughly
3. Consider adding additional providers as needed
4. Update documentation and tests

This interface design makes your authentication system much more flexible and maintainable!
