import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, switchMap } from 'rxjs/operators';
import { CognitoAuthService } from '../services/cognito-auth.service';
import { UserService } from '../../shared/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileCompleteGuard implements CanActivate {
  private cognitoAuth = inject(CognitoAuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.checkProfileComplete(state.url);
  }

  private checkProfileComplete(url: string): Observable<boolean> {
    return this.cognitoAuth.authState$.pipe(
      take(1),
      switchMap(authState => {
        if (!authState.isAuthenticated) {
          // Not authenticated, redirect to login
          localStorage.setItem('redirectUrl', url);
          this.router.navigate(['/auth/signin']);
          return [false];
        }

        // Check if user profile exists in our database
        return this.userService.checkUserProfile(authState.user?.email || '').pipe(
          map(userProfile => {
            if (!userProfile) {
              // No profile found, redirect to complete profile page
              // Don't store redirect URL for complete-profile page itself
              if (url !== '/complete-profile') {
                localStorage.setItem('redirectUrl', url);
              }
              this.router.navigate(['/complete-profile']);
              return false;
            }
            return true;
          })
        );
      })
    );
  }
}
