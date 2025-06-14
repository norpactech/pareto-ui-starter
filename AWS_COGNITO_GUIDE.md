# AWS Cognito Authentication Service

This document provides comprehensive documentation for the AWS Cognito authentication service integrated into the Angular application.

## Overview

The `CognitoAuthService` provides a complete authentication solution using AWS Cognito User Pools. It includes all necessary operations for user management, authentication, and session handling.

## Configuration

### Environment Variables

Add the following to your environment files (`.env.local`, `.env.dev`, `.env.prod`):

```bash
# AWS Cognito Configuration
COGNITO_REGION=us-east-1
COGNITO_USER_POOL_ID=your-user-pool-id-here
COGNITO_USER_POOL_CLIENT_ID=your-user-pool-client-id-here
```

### Required Information

To use this service, you need:

1. **Cognito Region**: The AWS region where your Cognito User Pool is located (e.g., `us-east-1`, `us-west-2`)
2. **User Pool ID**: The unique identifier for your Cognito User Pool (e.g., `us-east-1_ABC123def`)
3. **User Pool Client ID**: The client application ID from your User Pool (e.g., `abcdef123456789`)

## Installation

The required AWS SDK package is already included:

```bash
npm install @aws-sdk/client-cognito-identity-provider
```

## Service Methods

### 1. User Registration

#### `signUp(username: string, password: string, email: string, attributes?: object)`

Register a new user with Cognito.

```typescript
// Basic signup
this.cognitoAuth.signUp('johndoe', 'SecurePassword123!', 'john@example.com')
  .subscribe({
    next: (result) => {
      console.log('User registered:', result);
      // Navigate to confirmation page
    },
    error: (error) => {
      console.error('Registration failed:', error);
    }
  });

// Signup with additional attributes
this.cognitoAuth.signUp('johndoe', 'SecurePassword123!', 'john@example.com', {
  'given_name': 'John',
  'family_name': 'Doe',
  'phone_number': '+1234567890'
}).subscribe({
  next: (result) => {
    console.log('User registered with attributes:', result);
  },
  error: (error) => {
    console.error('Registration failed:', error);
  }
});
```

#### `confirmSignUp(username: string, code: string)`

Confirm user registration with verification code sent via email.

```typescript
this.cognitoAuth.confirmSignUp('johndoe', '123456')
  .subscribe({
    next: () => {
      console.log('Email confirmed successfully');
      // Navigate to sign-in page
    },
    error: (error) => {
      console.error('Confirmation failed:', error);
    }
  });
```

#### `resendConfirmationCode(username: string)`

Resend confirmation code to user's email.

```typescript
this.cognitoAuth.resendConfirmationCode('johndoe')
  .subscribe({
    next: (result) => {
      console.log('Confirmation code resent:', result);
    },
    error: (error) => {
      console.error('Failed to resend code:', error);
    }
  });
```

### 2. User Authentication

#### `signIn(username: string, password: string)`

Authenticate user with username and password.

```typescript
this.cognitoAuth.signIn('johndoe', 'SecurePassword123!')
  .subscribe({
    next: (result) => {
      console.log('Sign in successful:', result);
      // User is now authenticated
    },
    error: (error) => {
      console.error('Sign in failed:', error);
    }
  });
```

#### `signOut()`

Sign out the current user and clear all session data.

```typescript
this.cognitoAuth.signOut()
  .subscribe({
    next: () => {
      console.log('User signed out successfully');
      // User is redirected to home page
    },
    error: (error) => {
      console.error('Sign out failed:', error);
    }
  });
```

### 3. Password Management

#### `forgotPassword(username: string)`

Initiate password reset process.

```typescript
this.cognitoAuth.forgotPassword('johndoe')
  .subscribe({
    next: (result) => {
      console.log('Password reset initiated:', result);
      // Show message that reset code was sent to email
    },
    error: (error) => {
      console.error('Password reset failed:', error);
    }
  });
```

#### `confirmForgotPassword(username: string, code: string, newPassword: string)`

Confirm password reset with verification code and new password.

```typescript
this.cognitoAuth.confirmForgotPassword('johndoe', '123456', 'NewSecurePassword123!')
  .subscribe({
    next: () => {
      console.log('Password reset successful');
      // Navigate to sign-in page
    },
    error: (error) => {
      console.error('Password reset confirmation failed:', error);
    }
  });
```

#### `changePassword(oldPassword: string, newPassword: string)`

Change password for authenticated user.

```typescript
this.cognitoAuth.changePassword('OldPassword123!', 'NewPassword123!')
  .subscribe({
    next: () => {
      console.log('Password changed successfully');
    },
    error: (error) => {
      console.error('Password change failed:', error);
    }
  });
```

### 4. User Profile Management

#### `getCurrentUser()`

Get current authenticated user information.

```typescript
this.cognitoAuth.getCurrentUser()
  .subscribe({
    next: (user) => {
      console.log('Current user:', user);
    },
    error: (error) => {
      console.error('Failed to get user:', error);
    }
  });
```

#### `updateUserAttributes(attributes: object)`

Update user profile attributes.

```typescript
this.cognitoAuth.updateUserAttributes({
  'given_name': 'Jane',
  'family_name': 'Smith',
  'phone_number': '+1987654321'
}).subscribe({
  next: () => {
    console.log('User attributes updated successfully');
  },
  error: (error) => {
    console.error('Failed to update attributes:', error);
  }
});
```

#### `deleteUser()`

Delete the current user account.

```typescript
this.cognitoAuth.deleteUser()
  .subscribe({
    next: () => {
      console.log('User account deleted successfully');
      // User is signed out and redirected
    },
    error: (error) => {
      console.error('Failed to delete user:', error);
    }
  });
```

## State Management

### Authentication State

The service provides reactive authentication state through `authState$` observable:

```typescript
// Subscribe to authentication state changes
this.cognitoAuth.authState$.subscribe(state => {
  console.log('Auth state:', state);
  
  if (state.isAuthenticated) {
    console.log('User is authenticated:', state.user);
    console.log('Access token:', state.accessToken);
  } else {
    console.log('User is not authenticated');
  }
  
  if (state.loading) {
    console.log('Authentication operation in progress');
  }
  
  if (state.error) {
    console.error('Authentication error:', state.error);
  }
});
```

### State Properties

```typescript
interface CognitoAuthState {
  isAuthenticated: boolean;      // Whether user is authenticated
  user: CognitoUser | null;      // Current user information
  loading: boolean;              // Whether an operation is in progress
  error: string | null;          // Last error message
  accessToken: string | null;    // JWT access token
  idToken: string | null;        // JWT ID token
  refreshToken: string | null;   // Refresh token
}
```

### Quick Access Properties

```typescript
// Check authentication status
const isAuthenticated = this.cognitoAuth.isAuthenticated;

// Get current user
const currentUser = this.cognitoAuth.currentUser;

// Get tokens
const accessToken = this.cognitoAuth.accessToken;
const idToken = this.cognitoAuth.idToken;
const refreshToken = this.cognitoAuth.refreshToken;

// Get complete state
const authState = this.cognitoAuth.authState;
```

## Usage in Components

### Sign-in Component Example

```typescript
import { Component } from '@angular/core';
import { CognitoAuthService } from '../services/cognito-auth.service';

@Component({
  selector: 'app-sign-in',
  template: `
    <form (ngSubmit)="onSignIn()">
      <input [(ngModel)]="username" placeholder="Username" required>
      <input [(ngModel)]="password" type="password" placeholder="Password" required>
      <button type="submit" [disabled]="authState.loading">
        {{ authState.loading ? 'Signing In...' : 'Sign In' }}
      </button>
      <div *ngIf="authState.error" class="error">
        {{ authState.error }}
      </div>
    </form>
  `
})
export class SignInComponent {
  username = '';
  password = '';
  authState = this.cognitoAuth.authState;

  constructor(private cognitoAuth: CognitoAuthService) {}

  onSignIn() {
    this.cognitoAuth.signIn(this.username, this.password)
      .subscribe({
        next: () => {
          // Navigate to dashboard or home
          console.log('Sign in successful');
        },
        error: (error) => {
          // Error is handled by the service and reflected in authState
          console.error('Sign in failed:', error);
        }
      });
  }
}
```

### Sign-up Component Example

```typescript
import { Component } from '@angular/core';
import { CognitoAuthService } from '../services/cognito-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  template: `
    <form (ngSubmit)="onSignUp()" *ngIf="!showConfirmation">
      <input [(ngModel)]="username" placeholder="Username" required>
      <input [(ngModel)]="email" type="email" placeholder="Email" required>
      <input [(ngModel)]="password" type="password" placeholder="Password" required>
      <button type="submit" [disabled]="authState.loading">
        {{ authState.loading ? 'Creating Account...' : 'Sign Up' }}
      </button>
      <div *ngIf="authState.error" class="error">
        {{ authState.error }}
      </div>
    </form>

    <form (ngSubmit)="onConfirm()" *ngIf="showConfirmation">
      <h3>Confirm Your Email</h3>
      <p>We sent a confirmation code to {{ email }}</p>
      <input [(ngModel)]="confirmationCode" placeholder="Confirmation Code" required>
      <button type="submit" [disabled]="authState.loading">
        {{ authState.loading ? 'Confirming...' : 'Confirm' }}
      </button>
      <button type="button" (click)="resendCode()" [disabled]="authState.loading">
        Resend Code
      </button>
    </form>
  `
})
export class SignUpComponent {
  username = '';
  email = '';
  password = '';
  confirmationCode = '';
  showConfirmation = false;
  authState = this.cognitoAuth.authState;

  constructor(
    private cognitoAuth: CognitoAuthService,
    private router: Router
  ) {}

  onSignUp() {
    this.cognitoAuth.signUp(this.username, this.password, this.email)
      .subscribe({
        next: (result) => {
          console.log('Sign up successful:', result);
          this.showConfirmation = true;
        },
        error: (error) => {
          console.error('Sign up failed:', error);
        }
      });
  }

  onConfirm() {
    this.cognitoAuth.confirmSignUp(this.username, this.confirmationCode)
      .subscribe({
        next: () => {
          console.log('Email confirmed successfully');
          this.router.navigate(['/auth/signin']);
        },
        error: (error) => {
          console.error('Confirmation failed:', error);
        }
      });
  }

  resendCode() {
    this.cognitoAuth.resendConfirmationCode(this.username)
      .subscribe({
        next: () => {
          console.log('Confirmation code resent');
        },
        error: (error) => {
          console.error('Failed to resend code:', error);
        }
      });
  }
}
```

## Error Handling

The service provides comprehensive error handling with user-friendly error messages:

### Common Error Messages

- `User not found` - Username doesn't exist
- `Invalid username or password` - Authentication failed
- `User email not confirmed` - User needs to confirm email
- `Invalid password format` - Password doesn't meet requirements
- `Username already exists` - Username is taken
- `Invalid verification code` - Confirmation code is incorrect
- `Verification code expired` - Code has expired
- `Request limit exceeded` - Too many requests
- `Too many requests, please try again later` - Rate limited

### Error Handling Pattern

```typescript
this.cognitoAuth.signIn(username, password)
  .subscribe({
    next: (result) => {
      // Handle success
    },
    error: (error) => {
      // Error message is already set in authState.error
      // You can also access the raw error here
      console.error('Raw error:', error);
      
      // Show user-friendly message from authState
      const errorMessage = this.cognitoAuth.authState.error;
      this.showErrorToUser(errorMessage);
    }
  });
```

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage. For production, consider using secure HTTP-only cookies.

2. **Token Refresh**: The service doesn't automatically refresh tokens. Implement token refresh logic based on your requirements.

3. **HTTPS**: Always use HTTPS in production to protect tokens in transit.

4. **Environment Variables**: Keep Cognito configuration in environment variables, never in source code.

5. **Password Policy**: Configure strong password policies in your Cognito User Pool.

## AWS Cognito Setup

### 1. Create User Pool

1. Go to AWS Cognito console
2. Create a new User Pool
3. Configure sign-in options (username, email)
4. Configure password policy
5. Configure MFA (optional)
6. Configure email/SMS delivery

### 2. Create App Client

1. In your User Pool, create an App Client
2. Configure authentication flows (enable USER_PASSWORD_AUTH)
3. Configure OAuth flows if needed
4. Note the Client ID

### 3. Configure Environment

Update your environment files with:
- Region (e.g., us-east-1)
- User Pool ID (e.g., us-east-1_ABC123def)
- App Client ID (e.g., abcdef123456789)

## Testing

### Unit Testing

Mock the service in your tests:

```typescript
const mockCognitoAuth = {
  signIn: jasmine.createSpy('signIn').and.returnValue(of({})),
  signOut: jasmine.createSpy('signOut').and.returnValue(of({})),
  authState$: of({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    accessToken: null,
    idToken: null,
    refreshToken: null
  })
};

// In your test module
providers: [
  { provide: CognitoAuthService, useValue: mockCognitoAuth }
]
```

### Integration Testing

Test with actual Cognito service in a test environment:

1. Create a test User Pool
2. Use test credentials
3. Test all authentication flows
4. Clean up test users after tests

## Troubleshooting

### Common Issues

1. **Module not found**: Ensure AWS SDK is installed
2. **Configuration missing**: Check environment variables
3. **CORS errors**: Configure CORS in AWS if using from browser
4. **Token expired**: Implement token refresh or re-authentication
5. **User not confirmed**: Ensure email confirmation is completed

### Debug Mode

Enable debugging by setting `enableLogging: true` in environment:

```typescript
// The service will log detailed information to console
console.log('Cognito operation:', operation, result);
```

This comprehensive AWS Cognito service provides all the authentication functionality you need for your Angular application. Configure it with your Cognito User Pool details and you'll have a fully functional authentication system.
