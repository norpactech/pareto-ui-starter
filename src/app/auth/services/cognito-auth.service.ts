import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  GetUserCommand,
  UpdateUserAttributesCommand,
  DeleteUserCommand,
  GlobalSignOutCommand,
  AuthFlowType,
  ChallengeNameType,
  AttributeType
} from '@aws-sdk/client-cognito-identity-provider';
import { environment } from '../../../environments/environment';

export interface CognitoConfig {
  region: string;
  userPoolId: string;
  userPoolClientId: string;
}

export interface CognitoUser {
  username: string;
  email: string;
  attributes: { [key: string]: any };
}

export interface CognitoAuthState {
  isAuthenticated: boolean;
  user: CognitoUser | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  idToken: string | null;
  refreshToken: string | null;
}

export interface SignUpResult {
  userSub: string;
  codeDeliveryDetails?: {
    destination: string;
    deliveryMedium: string;
    attributeName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CognitoAuthService {
  private cognitoConfig!: CognitoConfig;
  private cognitoClient!: CognitoIdentityProviderClient;

  // Auth state management
  private authStateSubject = new BehaviorSubject<CognitoAuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    accessToken: null,
    idToken: null,
    refreshToken: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private router: Router) {
    this.initializeCognito();
    this.checkAuthState();
  }

  /**
   * Initialize Cognito with configuration
   */
  private initializeCognito(): void {
    this.cognitoConfig = {
      region: environment.cognito?.region || 'us-east-1',
      userPoolId: environment.cognito?.userPoolId || '',
      userPoolClientId: environment.cognito?.userPoolClientId || ''
    };

    if (!this.cognitoConfig.userPoolId || !this.cognitoConfig.userPoolClientId) {
      console.error('Cognito configuration missing. Please check environment variables.');
      this.updateAuthState({ error: 'Cognito configuration missing' });
      return;
    }

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.cognitoConfig.region
    });
  }

  /**
   * Check current authentication state from localStorage
   */
  private checkAuthState(): void {
    const accessToken = localStorage.getItem('cognito_access_token');
    const idToken = localStorage.getItem('cognito_id_token');
    const refreshToken = localStorage.getItem('cognito_refresh_token');
    const userData = localStorage.getItem('cognito_user');

    if (accessToken && idToken && userData) {
      try {
        const user = JSON.parse(userData);
        this.updateAuthState({
          isAuthenticated: true,
          user,
          accessToken,
          idToken,
          refreshToken
        });
        
        // Verify token is still valid
        this.getCurrentUser().subscribe({
          next: () => {
            // Token is valid, user remains authenticated
          },
          error: () => {
            // Token is invalid, sign out
            this.signOut();
          }
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearStoredAuth();
      }
    }
  }

  /**
   * Sign up a new user
   */
  signUp(username: string, password: string, email: string, attributes: { [key: string]: string } = {}): Observable<SignUpResult> {
    this.updateAuthState({ loading: true, error: null });

    const userAttributes: AttributeType[] = [
      { Name: 'email', Value: email }
    ];

    // Add additional attributes
    Object.keys(attributes).forEach(key => {
      userAttributes.push({ Name: key, Value: attributes[key] });
    });

    const command = new SignUpCommand({
      ClientId: this.cognitoConfig.userPoolClientId,
      Username: username,
      Password: password,
      UserAttributes: userAttributes
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(response => ({
        userSub: response.UserSub!,
        codeDeliveryDetails: response.CodeDeliveryDetails ? {
          destination: response.CodeDeliveryDetails.Destination!,
          deliveryMedium: response.CodeDeliveryDetails.DeliveryMedium!,
          attributeName: response.CodeDeliveryDetails.AttributeName!
        } : undefined
      })),
      tap(() => {
        this.updateAuthState({ loading: false });
      }),
      catchError(error => {
        this.updateAuthState({ 
          loading: false, 
          error: this.getErrorMessage(error) 
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Confirm sign up with verification code
   */
  confirmSignUp(username: string, code: string): Observable<void> {
    this.updateAuthState({ loading: true, error: null });

    const command = new ConfirmSignUpCommand({
      ClientId: this.cognitoConfig.userPoolClientId,
      Username: username,
      ConfirmationCode: code
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => void 0),
      tap(() => {
        this.updateAuthState({ loading: false });
      }),
      catchError(error => {
        this.updateAuthState({ 
          loading: false, 
          error: this.getErrorMessage(error) 
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Resend confirmation code
   */
  resendConfirmationCode(username: string): Observable<any> {
    this.updateAuthState({ loading: true, error: null });

    const command = new ResendConfirmationCodeCommand({
      ClientId: this.cognitoConfig.userPoolClientId,
      Username: username
    });

    return from(this.cognitoClient.send(command)).pipe(
      tap(() => {
        this.updateAuthState({ loading: false });
      }),
      catchError(error => {
        this.updateAuthState({ 
          loading: false, 
          error: this.getErrorMessage(error) 
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Sign in user
   */
  signIn(username: string, password: string): Observable<any> {
    this.updateAuthState({ loading: true, error: null });

    const command = new InitiateAuthCommand({
      ClientId: this.cognitoConfig.userPoolClientId,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    });

    return from(this.cognitoClient.send(command)).pipe(
      tap(response => {
        if (response.ChallengeName) {
          // Handle challenges (MFA, NEW_PASSWORD_REQUIRED, etc.)
          this.updateAuthState({ 
            loading: false, 
            error: `Challenge required: ${response.ChallengeName}` 
          });
        } else if (response.AuthenticationResult) {
          // Successful authentication
          const authResult = response.AuthenticationResult;
          this.handleSuccessfulAuth(username, authResult);
        }
      }),
      catchError(error => {
        this.updateAuthState({ 
          loading: false, 
          error: this.getErrorMessage(error) 
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Sign out user
   */
  signOut(): Observable<void> {
    this.updateAuthState({ loading: true });

    const accessToken = this.authStateSubject.value.accessToken;
    
    if (accessToken) {      const command = new GlobalSignOutCommand({
        AccessToken: accessToken
      });

      return from(this.cognitoClient.send(command)).pipe(
        map(() => void 0),
        tap(() => {
          this.clearStoredAuth();
          this.updateAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
            accessToken: null,
            idToken: null,
            refreshToken: null
          });
          this.router.navigate(['/']);
        }),
        catchError(error => {
          // Even if global sign out fails, clear local state
          this.clearStoredAuth();
          this.updateAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
            accessToken: null,
            idToken: null,
            refreshToken: null
          });
          this.router.navigate(['/']);
          return throwError(() => error);
        })
      );
    } else {
      this.clearStoredAuth();
      this.updateAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        accessToken: null,
        idToken: null,
        refreshToken: null
      });
      this.router.navigate(['/']);
      return from(Promise.resolve());
    }
  }

  /**
   * Forgot password
   */
  forgotPassword(username: string): Observable<any> {
    this.updateAuthState({ loading: true, error: null });

    const command = new ForgotPasswordCommand({
      ClientId: this.cognitoConfig.userPoolClientId,
      Username: username
    });

    return from(this.cognitoClient.send(command)).pipe(
      tap(() => {
        this.updateAuthState({ loading: false });
      }),
      catchError(error => {
        this.updateAuthState({ 
          loading: false, 
          error: this.getErrorMessage(error) 
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Confirm forgot password with new password
   */
  confirmForgotPassword(username: string, code: string, newPassword: string): Observable<void> {
    this.updateAuthState({ loading: true, error: null });

    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.cognitoConfig.userPoolClientId,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => void 0),
      tap(() => {
        this.updateAuthState({ loading: false });
      }),
      catchError(error => {
        this.updateAuthState({ 
          loading: false, 
          error: this.getErrorMessage(error) 
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Change password for authenticated user
   */
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    this.updateAuthState({ loading: true, error: null });

    const accessToken = this.authStateSubject.value.accessToken;
    if (!accessToken) {
      this.updateAuthState({ 
        loading: false, 
        error: 'No authenticated user found' 
      });
      return throwError(() => new Error('No authenticated user found'));
    }

    const command = new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: oldPassword,
      ProposedPassword: newPassword
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => void 0),
      tap(() => {
        this.updateAuthState({ loading: false });
      }),
      catchError(error => {
        this.updateAuthState({ 
          loading: false, 
          error: this.getErrorMessage(error) 
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user information
   */  getCurrentUser(): Observable<any> {
    const accessToken = this.authStateSubject.value.accessToken;
    console.log('getCurrentUser called, accessToken available:', !!accessToken);
    
    if (!accessToken) {
      console.error('No access token found in auth state');
      return throwError(() => new Error('No authenticated user found'));
    }

    const command = new GetUserCommand({
      AccessToken: accessToken
    });

    return from(this.cognitoClient.send(command));
  }

  /**
   * Update user attributes
   */
  updateUserAttributes(attributes: { [key: string]: string }): Observable<void> {
    this.updateAuthState({ loading: true, error: null });

    const accessToken = this.authStateSubject.value.accessToken;
    if (!accessToken) {
      this.updateAuthState({ 
        loading: false, 
        error: 'No authenticated user found' 
      });
      return throwError(() => new Error('No authenticated user found'));
    }

    const userAttributes: AttributeType[] = [];
    Object.keys(attributes).forEach(key => {
      userAttributes.push({ Name: key, Value: attributes[key] });
    });

    const command = new UpdateUserAttributesCommand({
      AccessToken: accessToken,
      UserAttributes: userAttributes
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => void 0),
      tap(() => {
        this.updateAuthState({ loading: false });
      }),
      catchError(error => {
        this.updateAuthState({ 
          loading: false, 
          error: this.getErrorMessage(error) 
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete user account
   */
  deleteUser(): Observable<void> {
    this.updateAuthState({ loading: true, error: null });

    const accessToken = this.authStateSubject.value.accessToken;
    if (!accessToken) {
      this.updateAuthState({ 
        loading: false, 
        error: 'No authenticated user found' 
      });
      return throwError(() => new Error('No authenticated user found'));
    }

    const command = new DeleteUserCommand({
      AccessToken: accessToken
    });

    return from(this.cognitoClient.send(command)).pipe(
      map(() => void 0),
      tap(() => {
        this.signOut();
      }),
      catchError(error => {
        this.updateAuthState({ 
          loading: false, 
          error: this.getErrorMessage(error) 
        });
        return throwError(() => error);
      })
    );
  }
  /**
   * Handle successful authentication
   */
  private handleSuccessfulAuth(username: string, authResult: any): void {
    const accessToken = authResult.AccessToken;
    const idToken = authResult.IdToken;
    const refreshToken = authResult.RefreshToken;

    // Store tokens
    localStorage.setItem('cognito_access_token', accessToken);
    localStorage.setItem('cognito_id_token', idToken);
    if (refreshToken) {
      localStorage.setItem('cognito_refresh_token', refreshToken);
    }    // Update auth state with tokens immediately
    this.updateAuthState({
      ...this.authStateSubject.value,
      accessToken,
      idToken,
      refreshToken
    });

    // Debug logging
    console.log('Auth tokens stored, attempting to get user info...');

    // Get user information
    this.getCurrentUser().subscribe({
      next: (userResponse) => {
        const userAttributes: { [key: string]: any } = {};
        userResponse.UserAttributes?.forEach((attr: AttributeType) => {
          if (attr.Name && attr.Value) {
            userAttributes[attr.Name] = attr.Value;
          }
        });

        const user: CognitoUser = {
          username: userResponse.Username || username,
          email: userAttributes['email'] || '',
          attributes: userAttributes
        };

        // Store user data
        localStorage.setItem('cognito_user', JSON.stringify(user));

        this.updateAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          error: null,
          accessToken,
          idToken,
          refreshToken
        });

        // Navigate to dashboard or home
        this.router.navigate(['/dashboard']);      },
      error: (error) => {
        console.error('Error getting user information:', error);
        
        // More specific error handling
        let errorMessage = 'Failed to get user information';
        if (error.name === 'NotAuthorizedException') {
          errorMessage = 'Authentication token is invalid or expired';
        } else if (error.name === 'UserNotFoundException') {
          errorMessage = 'User not found';
        } else if (error.message) {
          errorMessage = `Failed to get user information: ${error.message}`;
        }
        
        this.updateAuthState({ 
          loading: false, 
          error: errorMessage 
        });
      }
    });
  }

  /**
   * Clear stored authentication data
   */
  private clearStoredAuth(): void {
    localStorage.removeItem('cognito_access_token');
    localStorage.removeItem('cognito_id_token');
    localStorage.removeItem('cognito_refresh_token');
    localStorage.removeItem('cognito_user');
  }

  /**
   * Update auth state
   */
  private updateAuthState(updates: Partial<CognitoAuthState>): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({ ...currentState, ...updates });
  }

  /**
   * Get readable error message
   */
  private getErrorMessage(error: any): string {
    if (error.name) {
      switch (error.name) {
        case 'UserNotFoundException':
          return 'User not found';
        case 'NotAuthorizedException':
          return 'Invalid username or password';
        case 'UserNotConfirmedException':
          return 'User email not confirmed';
        case 'InvalidPasswordException':
          return 'Invalid password format';
        case 'UsernameExistsException':
          return 'Username already exists';
        case 'InvalidParameterException':
          return 'Invalid parameter';
        case 'CodeMismatchException':
          return 'Invalid verification code';
        case 'ExpiredCodeException':
          return 'Verification code expired';
        case 'LimitExceededException':
          return 'Request limit exceeded';
        case 'TooManyRequestsException':
          return 'Too many requests, please try again later';
        case 'PasswordResetRequiredException':
          return 'Password reset required';
        case 'UserLambdaValidationException':
          return 'User validation failed';
        default:
          return error.message || `Authentication error: ${error.name}`;
      }
    }
    return error.message || 'Unknown authentication error';
  }

  // Getters for current state
  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get currentUser(): CognitoUser | null {
    return this.authStateSubject.value.user;
  }

  get accessToken(): string | null {
    return this.authStateSubject.value.accessToken;
  }

  get idToken(): string | null {
    return this.authStateSubject.value.idToken;
  }

  get refreshToken(): string | null {
    return this.authStateSubject.value.refreshToken;
  }

  get authState(): CognitoAuthState {
    return this.authStateSubject.value;
  }
}
