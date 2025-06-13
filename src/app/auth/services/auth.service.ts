import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { 
  User, 
  SignInRequest, 
  SignUpRequest, 
  AuthResponse, 
  ForgotPasswordRequest, 
  ResetPasswordRequest, 
  VerifyEmailRequest,
  RefreshTokenRequest,
  ApiResponse,
  AuthState 
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.authUrl;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';
  private readonly TOKEN_REFRESH_BUFFER = environment.auth.tokenRefreshBuffer;
  private readonly SESSION_TIMEOUT = environment.auth.sessionTimeout;

  // Auth state management
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();
  private refreshTokenTimer?: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  // Initialize authentication state from localStorage
  private initializeAuth(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();
    
    if (token && user && !this.isTokenExpired(token)) {
      this.updateAuthState({
        isAuthenticated: true,
        user: user,
        loading: false,
        error: null
      });
      this.scheduleTokenRefresh();
    } else {
      this.clearAuthData();
    }
  }

  // Sign In
  signIn(credentials: SignInRequest): Observable<AuthResponse> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/signin`, credentials)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data);
            return response.data;
          }
          throw new Error(response.message);
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.setLoading(false))
      );
  }

  // Sign Up
  signUp(userData: SignUpRequest): Observable<AuthResponse> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/signup`, userData)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data);
            return response.data;
          }
          throw new Error(response.message);
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.setLoading(false))
      );
  }

  // Forgot Password
  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/forgot-password`, request)
      .pipe(
        map(response => {
          if (response.success) {
            return response.message;
          }
          throw new Error(response.message);
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.setLoading(false))
      );
  }

  // Reset Password
  resetPassword(request: ResetPasswordRequest): Observable<string> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/reset-password`, request)
      .pipe(
        map(response => {
          if (response.success) {
            return response.message;
          }
          throw new Error(response.message);
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.setLoading(false))
      );
  }

  // Verify Email
  verifyEmail(request: VerifyEmailRequest): Observable<string> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/verify-email`, request)
      .pipe(
        map(response => {
          if (response.success) {
            // Update user verification status
            const currentUser = this.getCurrentUser();
            if (currentUser) {
              const updatedUser = { ...currentUser, isEmailVerified: true };
              this.updateUser(updatedUser);
            }
            return response.message;
          }
          throw new Error(response.message);
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.setLoading(false))
      );
  }

  // Resend Verification Email
  resendVerificationEmail(): Observable<string> {
    this.setLoading(true);
    
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/resend-verification`, {})
      .pipe(
        map(response => {
          if (response.success) {
            return response.message;
          }
          throw new Error(response.message);
        }),
        catchError(this.handleError.bind(this)),
        tap(() => this.setLoading(false))
      );
  }

  // Refresh Token
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken) {
      return throwError('No refresh token available');
    }

    const request: RefreshTokenRequest = { refreshToken };
    
    return this.http.post<ApiResponse<AuthResponse>>(`${this.API_URL}/refresh-token`, request)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.handleAuthSuccess(response.data);
            return response.data;
          }
          throw new Error(response.message);
        }),
        catchError((error) => {
          this.signOut();
          return throwError(error);
        })
      );
  }

  // Sign Out
  signOut(): void {
    // Call logout endpoint (optional)
    this.http.post(`${this.API_URL}/signout`, {}).subscribe();
    
    // Clear local data
    this.clearAuthData();
    this.clearRefreshTimer();
    
    // Update state
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    });
    
    // Redirect to sign in
    this.router.navigate(['/auth/signin']);
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  // Get auth token for HTTP interceptor
  getToken(): string | null {
    return this.getStoredToken();
  }

  // Private helper methods
  private handleAuthSuccess(authResponse: AuthResponse): void {
    // Store tokens and user data
    localStorage.setItem(this.TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
    
    // Update auth state
    this.updateAuthState({
      isAuthenticated: true,
      user: authResponse.user,
      loading: false,
      error: null
    });
    
    // Schedule token refresh
    this.scheduleTokenRefresh();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.errors && Array.isArray(error.error.errors)) {
        errorMessage = error.error.errors.join(', ');
      } else {
        switch (error.status) {
          case 401:
            errorMessage = 'Invalid credentials';
            break;
          case 403:
            errorMessage = 'Access denied';
            break;
          case 404:
            errorMessage = 'Service not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
        }
      }
    }
    
    this.updateAuthState({
      ...this.authStateSubject.value,
      loading: false,
      error: errorMessage
    });
    
    return throwError(errorMessage);
  }

  private updateAuthState(newState: AuthState): void {
    this.authStateSubject.next(newState);
  }

  private updateUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.updateAuthState({
      ...this.authStateSubject.value,
      user: user
    });
  }

  private setLoading(loading: boolean): void {
    this.updateAuthState({
      ...this.authStateSubject.value,
      loading: loading,
      error: loading ? null : this.authStateSubject.value.error
    });
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  private scheduleTokenRefresh(): void {
    const token = this.getStoredToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      const refreshTime = expiryTime - currentTime - (5 * 60 * 1000); // Refresh 5 minutes before expiry

      if (refreshTime > 0) {
        this.refreshTokenTimer = timer(refreshTime).subscribe(() => {
          this.refreshToken().subscribe();
        });
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTokenTimer) {
      this.refreshTokenTimer.unsubscribe();
      this.refreshTokenTimer = null;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
