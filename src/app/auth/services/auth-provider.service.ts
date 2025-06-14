import { Injectable } from '@angular/core';
import { IAuthProvider, IAuthProviderFactory, AuthProviderConfig } from '../interfaces/auth-provider.interface';
import { CognitoAuthProvider } from '../providers/cognito-auth.provider';
import { EnvironmentService } from '../../shared/services/environment.service';

@Injectable({
  providedIn: 'root'
})
export class AuthProviderFactory implements IAuthProviderFactory {
  
  constructor(private environmentService: EnvironmentService) {}

  createProvider(config: AuthProviderConfig): IAuthProvider {
    switch (config.type) {
      case 'cognito':
        return new CognitoAuthProvider(this.environmentService);
      
      case 'firebase':
        throw new Error('Firebase auth provider not implemented yet');
      
      case 'auth0':
        throw new Error('Auth0 provider not implemented yet');
      
      case 'okta':
        throw new Error('Okta provider not implemented yet');
      
      default:
        throw new Error(`Unsupported auth provider type: ${config.type}`);
    }
  }

  getSupportedProviders(): string[] {
    return ['cognito']; // Add more as they're implemented
  }
}

// Service to manage and provide the current auth provider
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentProvider: IAuthProvider;

  constructor(
    private factory: AuthProviderFactory,
    private environmentService: EnvironmentService
  ) {
    // Initialize with default provider (Cognito for now)
    const config: AuthProviderConfig = {
      type: 'cognito',
      config: this.environmentService.cognito,
      enabled: true,
      primary: true
    };
    
    this.currentProvider = this.factory.createProvider(config);
  }

  // Delegate all auth operations to the current provider
  get authState$() { return this.currentProvider.authState$; }
  get currentUser$() { return this.currentProvider.currentUser$; }
  get isAuthenticated$() { return this.currentProvider.isAuthenticated$; }

  signUp = (request: any) => this.currentProvider.signUp(request);
  signIn = (request: any) => this.currentProvider.signIn(request);
  signOut = () => this.currentProvider.signOut();
  verifyEmail = (request: any) => this.currentProvider.verifyEmail(request);
  resendVerificationCode = (request: any) => this.currentProvider.resendVerificationCode(request);
  forgotPassword = (email: string) => this.currentProvider.forgotPassword(email);
  confirmForgotPassword = (confirmation: any) => this.currentProvider.confirmForgotPassword(confirmation);
  changePassword = (request: any) => this.currentProvider.changePassword(request);
  getCurrentUser = () => this.currentProvider.getCurrentUser();
  refreshSession = () => this.currentProvider.refreshSession();
  getAccessToken = () => this.currentProvider.getAccessToken();
  isTokenValid = () => this.currentProvider.isTokenValid();
  validatePasswordPolicy = (password: string) => this.currentProvider.validatePasswordPolicy(password);

  // Method to switch providers (for future use)
  switchProvider(config: AuthProviderConfig): void {
    this.currentProvider = this.factory.createProvider(config);
  }

  // Get the current provider instance (useful for provider-specific operations)
  getCurrentProvider(): IAuthProvider {
    return this.currentProvider;
  }
}
